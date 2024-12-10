<script lang="ts">
    import { allowDrop, drag, drop } from "$lib/dragndrop";
    let { type, color, number, canDrag }: { type: number; color: number; number: number; canDrag: boolean } = $props();
    const cardWidth = 2.25;
    const cardHeight = 3.5;
</script>

<!-- <div id="yay" ondrop={(event) => drop(event)} ondragover={(event) => allowDrop(event)}>Drop stuff to me</div> -->
<div id={`${type}${color}${number}`} draggable={canDrag ? true : false} ondragstart={(event) => drag(event)}>
    {#if type === 0}
        <!-- Normal card -->
        <div id="wh" style="--card-x: {(number - 1) * cardWidth}in; --card-y: {color * cardHeight}in" class="card card-small sm:card-large shrink-0 bg-auto bg-no-repeat"></div>
    {:else if type === 1}
        <!-- Back of card -->
        <div style="--card-x: {9 * cardWidth}in; --card-y: 0in" class="card card-small sm:card-large shrink-0 bg-auto bg-no-repeat"></div>
    {:else if type === 2}
        <!-- No card -->
        <div style="--card-x: 0; --card-y: 0" class="card-small sm:card-large rounded-lg bg-blue-600"></div>
    {/if}
</div>

<style>
    @tailwind components;
    @layer components {
        .card {
            background-image: url("/eustress_deck.svg");
        }
        .card-small {
            width: 0.675in;
            height: 1.05in;
            background-size: 6.75in 4.2in;
            background-position: calc(var(--card-x) * -0.3) calc(var(--card-y) * -0.3);
        }
        .card-large {
            width: 1.125in;
            height: 1.75in;
            background-size: 11.25in 7in;
            background-position: calc(var(--card-x) * -0.5) calc(var(--card-y) * -0.5);
        }
    }
</style>
