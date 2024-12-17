import { SlotType, CardSlot, gameState } from "$lib/game.svelte";

export function dragover(ev: DragEvent) {
    ev.preventDefault();
}
export function dragenter(ev: DragEvent) {
    ev.preventDefault();
    ev.target.classList.add("border-8");
}
export function dragleave(ev: DragEvent) {
    ev.preventDefault();
    ev.target.classList.remove("border-8");
}
export function dragstart(ev: DragEvent) {
    ev.dataTransfer.setData("fromSlot", ev.target.id);
}
export function drop(ev: DragEvent) {
    ev.preventDefault();
    ev.target.classList.remove("border-8");
    const fromSlotRaw = ev.dataTransfer.getData("fromSlot").split(" ");
    const toSlotRaw = ev.target.id.split(" ");
    const fromSlotType = Number(fromSlotRaw[0]);
    const fromSlotId = Number(fromSlotRaw[1]);
    const toSlotType = Number(toSlotRaw[0]);
    const toSlotId = Number(toSlotRaw[1]);

    // do some validation idk
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
    console.log("m");
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
