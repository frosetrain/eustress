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
            {card.count}
        </div>
    {:else if card.count < 1}
        <!-- No card -->
        <div
            style="--card-x: 0; --card-y: 0"
            class="card-small sm:card-large rounded-lg ring-4 ring-inset"
            class:ring-orange-600={orange}
            class:ring-blue-600={!orange}
        >
            {card.count}
        </div>
    {:else}
        <!-- Back of card -->
        <div style="--card-x: {9 * cardWidth}in; --card-y: 0in" class="card card-small sm:card-large shrink-0 bg-no-repeat">
            <p>
                {card.color}
                {card.number}
                {card.count}
            </p>
        </div>
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
