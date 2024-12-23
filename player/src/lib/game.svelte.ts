import { Data } from "dataclass";

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
    number: number = 1;
    count: number = 0;
    canDrag: boolean = false;
    canDrop: boolean = false;
}

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

export const selected: { [id: string]: number | boolean } = $state({ active: false, slotType: 0, slotId: 0 });

export function moveCard(fromSlotType: number, fromSlotId: number, toSlotType: number, toSlotId: number) {
    if (
        !(
            (fromSlotType === SlotType.playerDecks && toSlotType === SlotType.playerStacks) ||
            (fromSlotType === SlotType.playerStacks && toSlotType === SlotType.piles)
        )
    ) {
        return;
    }
    let fromSlot = gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId];
    let toSlot = gameState[Object.keys(SlotType)[toSlotType]][toSlotId];
    if (fromSlot.count <= 0) {
        return;
    }
    gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId] = fromSlot.copy({ count: fromSlot.count - 1, canDrag: fromSlot.count > 1 });
    gameState[Object.keys(SlotType)[toSlotType]][toSlotId] = toSlot.copy({
        color: fromSlot.color,
        number: fromSlot.number,
        flipped: fromSlot.flipped,
        count: toSlot.count + 1,
        canDrag: toSlot.type !== SlotType.piles,
    });
    fromSlot = gameState[Object.keys(SlotType)[fromSlotType]][fromSlotId];
    toSlot = gameState[Object.keys(SlotType)[toSlotType]][toSlotId];
}
