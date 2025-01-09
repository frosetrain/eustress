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
export function moveCard(
    opponent: boolean,
    fromSlotType: number,
    fromSlotId: number,
    toSlotType: number,
    toSlotId: number,
    revolution: boolean = false,
) {
    console.log(opponent, fromSlotType, fromSlotId, toSlotType, toSlotId);
    if (!opponent && moving.player && !revolution) {
        console.log("moveCard returned: player moving");
        return;
    }
    if (!opponent && !gameStarted.value && toSlotType === SlotType.piles) {
        console.log("moveCard returned: moved to pile before game started");
        return;
    }

    const fromSlot = gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId];
    const toSlot = gameState[Object.keys(SlotType)[toSlotType]][toSlotId];
    if (fromSlot.count <= 0) {
        console.log("moveCard returned: fromSlot count <= 0");
        return;
    }
    if (!opponent && !fromSlot.flipped && !revolution) {
        console.log("not flipped");
        return;
    }

    // When moving to piles, make sure it's one higher or lower
    const diff = Math.abs(fromSlot.number - toSlot.number);
    if (toSlot.type === SlotType.piles && !(diff === 1 || diff === 8) && !opponent && !revolution) {
        console.log("moveCard returned: number is not valid");
        return;
    }

    // When moving to stacks, make sure it's the same number
    if (toSlot.type === SlotType.playerStacks && toSlot.number !== 0 && fromSlot.number !== toSlot.number) {
        console.log("moveCard returned: number does not match");
        return;
    }

    // Send the move to the server
    if (!opponent && !revolution) {
        websocket.send(`move ${fromSlotType} ${fromSlotId} ${toSlotType} ${toSlotId} ${toSlot.number}`);
    }

    const showMove = (replacementColor: number, replacementNumber: number, deckCount: number | null = null) => {
        console.log(replacementColor, replacementNumber, deckCount);
        if (!opponent) {
            moving.player = true;
        }

        // Update from slot
        gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId] = fromSlot.copy({
            color: replacementColor,
            number: replacementNumber,
            count: fromSlot.count - 1,
            canDrag: !opponent && fromSlot.count > 1,
            flipped: !revolution && !(fromSlotType === SlotType.playerDecks || fromSlotType === SlotType.opponentDecks),
        });
        if (deckCount !== null) {
            gameState[opponent ? "opponentDecks" : "playerDecks"][0] = gameState[opponent ? "opponentDecks" : "playerDecks"][0].copy({
                count: deckCount,
            });
        }
        gameState[Object.keys(SlotType)[toSlotType]][toSlotId] = toSlot.copy({ flipped: !revolution && toSlot.number !== 0 }); // TODO

        // Play animation
        const fromBbox = document.getElementById(`${fromSlotType} ${fromSlotId}`)!.getBoundingClientRect();
        const toBbox = document.getElementById(`${toSlotType} ${toSlotId}`)!.getBoundingClientRect();
        const fake = document.getElementById(`${opponent ? "opponent" : "player"}${revolution ? "Unflip" : "Flip"}Fake`)!;
        const anim = animation[opponent ? "opponent" : "player"];
        anim.playing = true;
        anim.fromX = fromBbox.left;
        anim.fromY = fromBbox.top;
        anim.color = fromSlot.color;
        anim.number = fromSlot.number;
        anim.flipped = !revolution;

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
                flipped: !revolution,
                count: toSlot.count + 1,
                canDrag: !opponent && toSlot.type !== SlotType.piles,
            });

            if (revolution) {
                delay(() => {
                    gameState[Object.keys(SlotType)[toSlotType]][toSlotId] = gameState[Object.keys(SlotType)[toSlotType]][toSlotId].copy({
                        flipped: true,
                    });
                }, 1);
            }

            // If not started and all piles are filled, be ready
            if (!opponent && !gameStarted.value && gameState.playerStacks.every((x) => x.count > 0)) {
                websocket.send("ready");
            }

            if (!opponent) moving.player = false;
        }, animationDuration);
    };
    if (opponent || revolution) {
        return showMove;
    } else {
        onAffirm.value = showMove;
    }
    return () => {};
}

// i should really put all these in a class
export const moving = $state({ player: false });
export const gameSetup = $state({ value: false });
export const gameStarted = $state({ value: false });
export const onAffirm = $state({ value: (arg1: number, arg2: number, arg3: number) => {} }); // eslint-disable-line
export const websocket = new WebSocket("ws://localhost:8765");
export const joinKey = $state({ value: 0 });
export const player = $state({ value: 0 });
export const selected = $state({ active: false, slotType: 0, slotId: 0 });
export const animation = $state({
    player: { playing: false, color: 0, number: 0, fromX: 0, fromY: 0, flipped: true },
    opponent: { playing: false, color: 0, number: 0, fromX: 0, fromY: 0, flipped: true },
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
