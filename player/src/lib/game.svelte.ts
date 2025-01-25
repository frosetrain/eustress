import { Data } from "dataclass";
import { PUBLIC_SERVER } from "$env/static/public";
import { animate, delay } from "motion";
import { showShout } from "./shout.svelte";

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

// i should really put all these in a class
export const moving = $state({ player: false });
export const gameSetup = $state({ value: false });
export const gameStarted = $state({ value: false });
export const onAffirm: { queue: ((arg1: number, arg2: number, arg3: number) => void)[] } = $state({ queue: [] });
export const websocket = new WebSocket(`wss://${PUBLIC_SERVER}`);
export const joinKey = $state({ value: 0 });
export const player = $state({ value: 0 });
export const selected = $state({ active: false, slotType: 0, slotId: 0 });
export const walkthroughStep = $state({ value: 0 });
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

const animationDuration = 0.2;
export function playAnimation(
    fromSlotType: number,
    fromSlotId: number,
    toSlotType: number,
    toSlotId: number,
    animColor: number,
    animNumber: number,
    opponent: boolean,
    revolution: boolean,
    afterComplete: () => void,
) {
    if (!opponent) {
        moving.player = true;
    }

    const fromBbox = document.getElementById(`${fromSlotType} ${fromSlotId}`)!.getBoundingClientRect();
    const toBbox = document.getElementById(`${toSlotType} ${toSlotId}`)!.getBoundingClientRect();
    const fake = document.getElementById(`${opponent ? "opponent" : "player"}${revolution ? "Unflip" : "Flip"}Fake`)!;
    const anim = animation[opponent ? "opponent" : "player"];
    anim.playing = true;
    anim.fromX = fromBbox.left;
    anim.fromY = fromBbox.top;
    anim.color = animColor;
    anim.number = animNumber;
    anim.flipped = !revolution;

    const offsetX = toBbox.x - fromBbox.x;
    const offsetY = toBbox.y - fromBbox.y;
    const framerMotion = animate(fake, { x: offsetX, y: offsetY }, { ease: "easeOut", duration: animationDuration });

    delay(() => {
        // Reset the animation to the start and hide fake
        framerMotion.cancel();
        anim.playing = false;

        afterComplete();

        if (!opponent) moving.player = false;
    }, animationDuration);
}

export function moveCard(
    opponent: boolean,
    fromSlotType: number,
    fromSlotId: number,
    toSlotType: number,
    toSlotId: number,
    revolution: boolean = false,
) {
    console.debug(opponent, fromSlotType, fromSlotId, toSlotType, toSlotId);
    if (!opponent && moving.player && !revolution) {
        console.debug("moveCard returned: player moving");
        showShout("You can’t make another move during the animation.", true, false);
        return;
    }
    if (!opponent && !gameStarted.value && toSlotType === SlotType.piles) {
        console.debug("moveCard returned: moved to pile before game started");
        showShout("You can’t move cards to the piles before the game begins.", true, false);
        return;
    }

    const fromSlot = gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId];
    const toSlot = gameState[Object.keys(SlotType)[toSlotType]][toSlotId];
    if (fromSlot.count <= 0) {
        console.debug("moveCard returned: fromSlot count <= 0");
        return;
    }
    if (!opponent && !fromSlot.flipped && !revolution) {
        console.debug("not flipped");
        showShout("Flip the card first.", true, false);
        return;
    }

    // When moving to piles, make sure it's one higher or lower
    const diff = Math.abs(fromSlot.number - toSlot.number);
    if (toSlot.type === SlotType.piles && !(diff === 1 || diff === 8) && !opponent && !revolution) {
        console.debug("moveCard returned: number is not valid");
        showShout("The moved card’s number must be one higher or one lower than the pile.", true, false);
        return;
    }

    // When moving to stacks, make sure it's the same number
    if (toSlot.type === SlotType.playerStacks && toSlot.number !== 0 && fromSlot.number !== toSlot.number) {
        console.debug("moveCard returned: number does not match");
        showShout("The moved card’s number must be the same as the stack.", true, false);
        return;
    }

    if (walkthroughStep.value === 0 || walkthroughStep.value === 1) {
        walkthroughStep.value++;
    }
    if (toSlot.type === SlotType.piles && (walkthroughStep.value === 4 || walkthroughStep.value === 5 || walkthroughStep.value === 6)) {
        walkthroughStep.value++;
    }

    // Send the move to the server
    if (!opponent && !revolution) {
        websocket.send(`move ${fromSlotType} ${fromSlotId} ${toSlotType} ${toSlotId} ${toSlot.number}`);
    }

    const showMove = (replacementColor: number, replacementNumber: number, deckCount: number | null = null) => {
        console.debug(replacementColor, replacementNumber, deckCount);

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
        gameState[Object.keys(SlotType)[toSlotType]][toSlotId] = toSlot.copy({ flipped: !revolution && toSlot.number !== 0 });

        // Play animation
        playAnimation(fromSlotType, fromSlotId, toSlotType, toSlotId, fromSlot.color, fromSlot.number, opponent, revolution, () => {
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
                    if (walkthroughStep.value === 3) {
                        walkthroughStep.value++;
                    }
                }, 1);
            }

            // If not started and all piles are filled, be ready
            if (!opponent && !gameStarted.value && gameState.playerStacks.every((x) => x.count > 0)) {
                websocket.send("ready");
            }
        });
    };

    if (opponent || revolution) {
        return showMove;
    } else {
        onAffirm.queue.push(showMove);
    }
    return () => {};
}
