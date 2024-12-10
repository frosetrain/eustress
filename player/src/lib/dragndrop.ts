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
    var fromSlot = ev.dataTransfer.getData("fromSlot");
    console.log(fromSlot, ev.target.id);
}
