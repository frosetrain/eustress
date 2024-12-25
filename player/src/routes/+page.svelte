<script lang="ts">
    import { onMount } from "svelte";
    import { polyfill } from "mobile-drag-drop";
    import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
    import { gameState, SlotType, selected, moveCard, moving } from "$lib/game.svelte";
    import CardSlot from "$lib/cardslot.svelte";

    let newSelected = { slotType: 0, slotId: 0 };
    function updateSelected() {
        selected.slotType = newSelected.slotType;
        selected.slotId = newSelected.slotId;
    }
    function onKeyPress(event: KeyboardEvent) {
        if (moving.value) {
            return;
        }
        const stackKeys = "asdf";
        const pileKeys = "jk";
        const deckKey = "n";

        if (pileKeys.includes(event.key)) {
            newSelected.slotType = SlotType.piles;
            newSelected.slotId = pileKeys.indexOf(event.key);
        } else if (stackKeys.includes(event.key)) {
            newSelected.slotType = SlotType.playerStacks;
            newSelected.slotId = stackKeys.indexOf(event.key);
        } else if (deckKey === event.key) {
            newSelected.slotType = SlotType.playerDecks;
            newSelected.slotId = 0;
        } else {
            return;
        }

        if (selected.active && selected.slotType === newSelected.slotType && selected.slotId === newSelected.slotId) {
            selected.active = false;
        } else if (!selected.active && newSelected.slotType !== SlotType.piles) {
            selected.active = true;
            updateSelected();
        } else if (selected.slotType === SlotType.playerDecks && newSelected.slotType === SlotType.playerStacks) {
            moveCard(selected.slotType, selected.slotId, newSelected.slotType, newSelected.slotId);
            selected.active = true;
            updateSelected();
        } else if (selected.slotType === SlotType.playerStacks && newSelected.slotType === SlotType.piles) {
            moveCard(selected.slotType, selected.slotId, newSelected.slotType, newSelected.slotId);
            selected.active = false;
            updateSelected();
        } else if (newSelected.slotType !== SlotType.piles) {
            selected.active = true;
            updateSelected();
        } else {
            selected.active = false;
        }
    }

    onMount(() => {
        polyfill({
            dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
        });
    });
</script>

<svelte:window on:dragenter={(event) => event.preventDefault()} on:touchmove={() => {}} on:keypress|preventDefault={onKeyPress} />

<div class="flex min-h-screen justify-center bg-amber-100 dark:bg-gray-900">
    <div
        class="flex w-screen max-w-screen-md flex-col justify-between bg-gray-700 p-2 shadow-lg shadow-orange-600 ring-4 ring-orange-600/60 sm:m-8 sm:rounded-lg sm:p-4"
    >
        <!-- Other stacks -->
        <div class="flex justify-between gap-1">
            {#each gameState.opponentDecks as card}
                <CardSlot {card} />
            {/each}
            <div class="flex gap-1 sm:gap-2">
                {#each gameState.opponentStacks as card}
                    <CardSlot {card} />
                {/each}
            </div>
        </div>
        <div class="flex justify-evenly">
            <button id="amogus" class="my-auto shrink-0 rounded bg-orange-400 px-4 py-2.5 text-lg font-black text-gray-900 disabled:opacity-25"
                >STRESS</button
            >
            <div class="flex gap-1 sm:gap-2">
                {#each gameState.piles as card}
                    <CardSlot {card} />
                {/each}
            </div>
            <button class="my-auto shrink-0 rounded bg-orange-400 px-4 py-2.5 text-lg font-black text-gray-900 disabled:opacity-25">STRESS</button>
        </div>
        <!-- Player stacks -->
        <div class="flex justify-between gap-1">
            <div class="flex gap-1 sm:gap-2">
                {#each gameState.playerStacks as card}
                    <CardSlot {card} />
                {/each}
            </div>
            {#each gameState.playerDecks as card}
                <CardSlot {card} />
            {/each}
        </div>
    </div>
</div>
