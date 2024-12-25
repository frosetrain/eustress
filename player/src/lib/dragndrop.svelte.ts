import { moveCard, moving } from "$lib/game.svelte";

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
    if (moving.value) {
        return;
    }
    const fromSlotRaw = ev.dataTransfer.getData("fromSlot").split(" ");
    const toSlotRaw = ev.target.id.split(" ");
    const fromSlotType = Number(fromSlotRaw[0]);
    const fromSlotId = Number(fromSlotRaw[1]);
    const toSlotType = Number(toSlotRaw[0]);
    const toSlotId = Number(toSlotRaw[1]);
    moveCard(fromSlotType, fromSlotId, toSlotType, toSlotId);
}
