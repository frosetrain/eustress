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
export function moveCard(opponent: boolean, fromSlotType: number, fromSlotId: number, toSlotType: number, toSlotId: number) {
    console.log(opponent, fromSlotType, fromSlotId, toSlotType, toSlotId);
    if (!opponent && moving.player) {
        return;
    }

    const fromSlot = gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId];
    const toSlot = gameState[Object.keys(SlotType)[toSlotType]][toSlotId];
    if (fromSlot.count <= 0) {
        return;
    }

    // When moving to piles, make sure it's one higher or lower
    const diff = Math.abs(fromSlot.number - toSlot.number);
    if (toSlot.type === SlotType.piles && !(diff === 1 || diff === 8) && !opponent) {
        return;
    }

    // When moving to stacks, make sure it's the same number
    if (toSlot.type === SlotType.playerStacks && toSlot.number !== 0 && fromSlot.number !== toSlot.number) {
        return;
    }

    // Send the move to the server
    if (!opponent) {
        moving.player = true;
        websocket.send(`move ${fromSlotType} ${fromSlotId} ${toSlotType} ${toSlotId} ${toSlot.number}`);
    }

    const showMove = (replacementColor: number, replacementNumber: number, deckCount: number) => {
        // Update from slot
        gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId] = fromSlot.copy({
            color: replacementColor,
            number: replacementNumber,
            count: fromSlot.count - 1,
            canDrag: !opponent && fromSlot.count > 1,
            flipped: !(fromSlotType === SlotType.playerDecks || fromSlotType === SlotType.opponentDecks),
        });
        gameState[opponent ? "opponentDecks" : "playerDecks"][0] = gameState[opponent ? "opponentDecks" : "playerDecks"][0].copy({
            count: deckCount,
        });
        gameState[Object.keys(SlotType)[toSlotType]][toSlotId] = toSlot.copy({ flipped: true });

        // Play animation
        const fromBbox = document.getElementById(`${fromSlotType} ${fromSlotId}`)!.getBoundingClientRect();
        const toBbox = document.getElementById(`${toSlotType} ${toSlotId}`)!.getBoundingClientRect();
        const fake = document.getElementById(`${opponent ? "opponent" : "player"}Fake`)!;
        const anim = animation[opponent ? "opponent" : "player"];
        anim.playing = true;
        anim.fromX = fromBbox.left;
        anim.fromY = fromBbox.top;
        anim.color = fromSlot.color;
        anim.number = fromSlot.number;

        const offsetX = toBbox.x - fromBbox.x;
        const offsetY = toBbox.y - fromBbox.y;
        const framerMotion = animate(fake, { x: offsetX, y: offsetY }, { ease: "easeOut", duration: animationDuration });

        delay(() => {
            // Reset the animation to the start and hide fake
            framerMotion.cancel();
            anim.playing = false;

            // Update to slot
            gameState[Object.keys(SlotType)[toSlotType]][toSlotId] = toSlot.copy({
                color: fromSlot.color,
                number: fromSlot.number,
                flipped: true,
                count: toSlot.count + 1,
                canDrag: !opponent && toSlot.type !== SlotType.piles,
            });

            if (!opponent) moving.player = false;
        }, animationDuration);
    };
    if (opponent) {
        return showMove;
    } else {
        onAffirm.value = showMove;
    }
    return () => {};
}

// i should really put all these in a class
export const moving = $state({ player: false });
export const gameOngoing = $state({ value: false });
export const onAffirm = $state({ value: (arg1: number, arg2: number, arg3: number) => {} }); // eslint-disable-line
export const websocket = new WebSocket("ws://localhost:8765");
export const joinKey = $state({ value: 0 });
export const player = $state({ value: 0 });
export const selected = $state({ active: false, slotType: 0, slotId: 0 });
export const animation = $state({
    player: { playing: false, color: 0, number: 0, fromX: 0, fromY: 0 },
    opponent: { playing: false, color: 0, number: 0, fromX: 0, fromY: 0 },
});
export const gameState: { [id: string]: CardSlot[] } = $state({
    playerStacks: [],
    opponentStacks: [],
    piles: [CardSlot.create({ id: 0, type: SlotType.piles, canDrop: true }), CardSlot.create({ id: 1, type: SlotType.piles, canDrop: true })],
    playerDecks: [CardSlot.create({ id: 0, type: SlotType.playerDecks, color: 2, number: 3, count: 36, flipped: false, canDrag: true })],
    opponentDecks: [CardSlot.create({ id: 0, type: SlotType.opponentDecks, color: 2, number: 3, count: 36, flipped: false })],
});
for (let i = 0; i < 4; ++i) {
    gameState.playerStacks.push(CardSlot.create({ id: i, type: SlotType.playerStacks, canDrop: true }));
    gameState.opponentStacks.push(CardSlot.create({ id: i, type: SlotType.opponentStacks }));
}
