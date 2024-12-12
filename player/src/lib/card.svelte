<script lang="ts">
    import { dragenter, dragover, dragstart, drop, dragleave } from "$lib/dragndrop";
    let { type, color, number, canDrag = false, canDrop = false }: { type: number; color: number; number: number; canDrag: boolean; canDrop: boolean } = $props();
    const cardWidth = 2.25;
    const cardHeight = 3.5;
</script>

<div id={`${type}${color}${number}`} class="relative" draggable={canDrag ? true : false} ondragstart={(event) => dragstart(event)} onclick={() => console.log("clicked")}>
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

    {#if canDrop}
        <div
            id={`${type}${color}${number}`}
            class="absolute left-0 top-0 h-full w-full rounded-lg border-fuchsia-500"
            ondrop={(event) => drop(event)}
            ondragenter={(event) => dragenter(event)}
            ondragleave={(event) => dragleave(event)}
            ondragover={(event) => dragover(event)}
        ></div>
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
