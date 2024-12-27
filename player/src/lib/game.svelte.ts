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
            (fromSlotType === SlotType.playerStacks && toSlotType === SlotType.piles)
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

    const showMove = () => {
        // Update from slot
        gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId] = fromSlot.copy({ count: fromSlot.count - 1, canDrag: fromSlot.count > 1 });

        // Play animation
        const fromFake = document.getElementById(`fake ${fromSlotType} ${fromSlotId}`)!;
        const toFake = document.getElementById(`fake ${toSlotType} ${toSlotId}`)!;
        fromFake.style.zIndex = "10";
        const offsetX = toFake.getBoundingClientRect().x - fromFake.getBoundingClientRect().x;
        const offsetY = toFake.getBoundingClientRect().y - fromFake.getBoundingClientRect().y;
        const animation = animate(fromFake, { x: offsetX, y: offsetY }, { ease: "easeOut", duration: animationDuration });
        delay(() => {
            // Reset the animation to the start and hide fake
            animation.cancel();
            fromFake.style.zIndex = "-10";

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

export const moving = $state({ value: false }); // hack
export const gameOngoing = $state({ value: false });
export const onAffirm = $state({ value: () => {} });
export const websocket = new WebSocket("ws://localhost:8765");
export const joinKey = $state({ value: 0 });
export const selected: { active: boolean; slotType: number; slotId: number } = $state({ active: false, slotType: 0, slotId: 0 });
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
