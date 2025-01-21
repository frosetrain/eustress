<script lang="ts">
    import { dragenter, dragover, dragstart, drop, dragleave } from "$lib/dragndrop.svelte";
    import { selected, CardSlot, SlotType, gameSetup, gameState } from "$lib/game.svelte";
    let { card }: { card: CardSlot } = $props();
    const orange = card.type === SlotType.playerDecks || card.type === SlotType.playerStacks;
    const cardWidth = 2.25;
    const cardHeight = 3.5;

    function flipCard() {
        if (!gameSetup.value) return;
        if (card.type === SlotType.playerDecks) {
            if (gameState.playerStacks.every((x) => x.count > 0)) {
                return;
            }
            gameState[Object.keys(SlotType)[card.type]][card.id] = gameState[Object.keys(SlotType)[card.type]][card.id].copy({ flipped: true });
        }
    }
</script>

{#snippet cardCounter(count: number)}
    <div class="ml-auto flex w-7 justify-center rounded-md bg-gray-100 font-mono backdrop-blur-sm sm:rounded-xl">
        {count}
    </div>
{/snippet}

<div
    id={`${card.type} ${card.id}`}
    class="relative"
    draggable={gameSetup.value && card.canDrag ? true : false}
    ondragstart={(event) => dragstart(event)}
    onclick={flipCard}
>
    <!-- <p>{card.type} {card.id} {card.canDrag} {card.flipped}</p> -->
    {#if card.flipped && card.count > 0}
        <!-- Normal card -->
        <div
            style="--card-x: {(card.number - 1) * cardWidth}in; --card-y: {card.color * cardHeight}in"
            class="card card-small sm:card-large shrink-0 bg-no-repeat"
        >
            {@render cardCounter(card.count)}
        </div>
    {:else if card.count < 1}
        <!-- No card -->
        <div
            style="--card-x: 0; --card-y: 0"
            class="card-small sm:card-large rounded-md ring-4 ring-inset sm:rounded-xl"
            class:ring-orange-600={orange}
            class:ring-gray-400={!orange}
            class:dark:ring-gray-500={!orange}
        ></div>
    {:else}
        <!-- Back of card -->
        <div style="--card-x: {9 * cardWidth}in; --card-y: 0in" class="card card-small sm:card-large shrink-0 bg-no-repeat">
            {@render cardCounter(card.count)}
        </div>
    {/if}

    {#if selected.active && selected.slotType === card.type && selected.slotId === card.id}
        <div class="absolute left-0 top-0 h-full w-full rounded-md border-8 border-fuchsia-500 sm:rounded-xl"></div>
    {/if}
    {#if card.canDrop}
        <div
            id={`${card.type} ${card.id}`}
            class="absolute left-0 top-0 h-full w-full rounded-md border-fuchsia-500 sm:rounded-xl"
            ondrop={(event) => drop(event)}
            ondragenter={(event) => dragenter(event)}
            ondragleave={(event) => dragleave(event)}
            ondragover={(event) => dragover(event)}
        ></div>
    {/if}
</div>
