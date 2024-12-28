<script lang="ts">
    import { dragenter, dragover, dragstart, drop, dragleave } from "$lib/dragndrop.svelte";
    import { selected, CardSlot, SlotType, gameOngoing, gameState } from "$lib/game.svelte";
    let { card }: { card: CardSlot } = $props();
    const cardWidth = 2.25;
    const cardHeight = 3.5;

    function flipCard() {
        if (card.type === SlotType.playerDecks) {
            gameState[Object.keys(SlotType)[card.type]][card.id] = gameState[Object.keys(SlotType)[card.type]][card.id].copy({ flipped: true });
        }
    }
</script>

<div
    id={`${card.type} ${card.id}`}
    class="relative"
    draggable={gameOngoing.value && card.canDrag ? true : false}
    ondragstart={(event) => dragstart(event)}
    onclick={flipCard}
>
    <!-- <p>{card.type} {card.id} {card.canDrag} {card.flipped}</p> -->
    {#if card.flipped && card.count > 0}
        <!-- Normal card -->
        <div
            style="--card-x: {(card.number - 1) * cardWidth}in; --card-y: {card.color * cardHeight}in"
            class="card card-small sm:card-large shrink-0 bg-auto bg-no-repeat"
        ></div>
    {:else if !card.flipped}
        <!-- Back of card -->
        <div style="--card-x: {9 * cardWidth}in; --card-y: 0in" class="card card-small sm:card-large shrink-0 bg-auto bg-no-repeat">
            <p>{card.count}</p>
        </div>
    {:else}
        <!-- No card -->
        <div style="--card-x: 0; --card-y: 0" class="card-small sm:card-large rounded-lg bg-gray-800"></div>
    {/if}

    {#if selected.active && selected.slotType === card.type && selected.slotId === card.id}
        <div class="absolute left-0 top-0 h-full w-full rounded-lg border-8 border-orange-500"></div>
    {/if}
    {#if card.canDrop}
        <div
            id={`${card.type} ${card.id}`}
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
