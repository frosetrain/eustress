export function allowDrop(ev: DragEvent) {
    ev.preventDefault();
}
export function drag(ev: DragEvent) {
    ev.dataTransfer.setData("fromSlot", ev.target.id);
}
export function drop(ev: DragEvent) {
    ev.preventDefault();
    var fromSlot = ev.dataTransfer.getData("fromSlot");
    console.log(fromSlot, ev.target.id);
}
