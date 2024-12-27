import { Data } from "dataclass";
import { animate, delay } from "motion";

export const SlotType = {
    playerStacks: 0,
    opponentStacks: 1,
    piles: 2,
    playerDecks: 3,
    opponentDecks: 4,
};

export class CardSlot extends Data {
    id: number = 0;
    type: number = -1;
    flipped: boolean = true;
    color: number = 0;
    number: number = 0;
    count: number = 0;
    canDrag: boolean = false;
    canDrop: boolean = false;
}

const animationDuration = 0.2;
export async function moveCard(fromSlotType: number, fromSlotId: number, toSlotType: number, toSlotId: number) {
    if (moving.value) {
        return;
    }
    if (
        !(
            (fromSlotType === SlotType.playerDecks && toSlotType === SlotType.playerStacks) ||
            (fromSlotType === SlotType.playerStacks && toSlotType === SlotType.piles) ||
            (fromSlotType === SlotType.playerDecks && toSlotType === SlotType.piles)
        )
    ) {
        return;
    }
    const fromSlot = gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId];
    const toSlot = gameState[Object.keys(SlotType)[toSlotType]][toSlotId];
    if (fromSlot.count <= 0) {
        return;
    }

    // Send the move to the server
    moving.value = true;
    websocket.send(`move ${fromSlotType} ${fromSlotId} ${toSlotType} ${toSlotId} ${toSlot.number}`);

    const showMove = (replacementColor: number, replacementNumber: number, deckCount: number) => {
        // Update from slot
        gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId] = fromSlot.copy({
            color: replacementColor,
            number: replacementNumber,
            count: fromSlot.count - 1,
            canDrag: fromSlot.count > 1,
        });
        gameState.playerDecks[0] = gameState.playerDecks[0].copy({
            count: deckCount,
        });
        animation.playing = true;

        // Play animation
        const fromBbox = document.getElementById(`${fromSlotType} ${fromSlotId}`)!.getBoundingClientRect();
        const toBbox = document.getElementById(`${toSlotType} ${toSlotId}`)!.getBoundingClientRect();
        const fake = document.getElementById("fake")!;
        animation.fromX = fromBbox.left;
        animation.fromY = fromBbox.top;
        console.log(animation.fromX, animation.fromY);
        const offsetX = toBbox.x - fromBbox.x;
        const offsetY = toBbox.y - fromBbox.y;
        const framerMotion = animate(fake, { x: offsetX, y: offsetY }, { ease: "easeOut", duration: animationDuration });
        animation.color = fromSlot.color;
        animation.number = fromSlot.number;

        delay(() => {
            // Reset the animation to the start and hide fake
            framerMotion.cancel();
            animation.playing = false;

            // Update to slot
            gameState[Object.keys(SlotType)[toSlotType]][toSlotId] = toSlot.copy({
                color: fromSlot.color,
                number: fromSlot.number,
                flipped: fromSlot.flipped,
                count: toSlot.count + 1,
                canDrag: toSlot.type !== SlotType.piles,
            });

            moving.value = false;
        }, animationDuration);
    };
    onAffirm.value = showMove;
}

// i should really put all these in a class
export const moving = $state({ value: false }); // hack
export const gameOngoing = $state({ value: false });
export const onAffirm = $state({ value: (arg1: number, arg2: number, arg3: number) => {} }); // eslint-disable-line
export const websocket = new WebSocket("ws://localhost:8765");
export const joinKey = $state({ value: 0 });
export const player = $state({ value: 0 });
export const selected = $state({ active: false, slotType: 0, slotId: 0 });
export const animation = $state({ playing: false, color: 0, number: 0, fromX: 0, fromY: 0 });
export const gameState: { [id: string]: CardSlot[] } = $state({
    playerStacks: [],
    opponentStacks: [],
    piles: [CardSlot.create({ id: 0, type: SlotType.piles, canDrop: true }), CardSlot.create({ id: 1, type: SlotType.piles, canDrop: true })],
    playerDecks: [CardSlot.create({ id: 0, type: SlotType.playerDecks, color: 2, number: 3, count: 36, canDrag: true })],
    opponentDecks: [CardSlot.create({ id: 0, type: SlotType.opponentDecks, color: 2, number: 3, count: 36 })],
});
for (let i = 0; i < 4; ++i) {
    gameState.playerStacks.push(CardSlot.create({ id: i, type: SlotType.playerStacks, canDrop: true }));
    gameState.opponentStacks.push(CardSlot.create({ id: i, type: SlotType.opponentStacks }));
}
