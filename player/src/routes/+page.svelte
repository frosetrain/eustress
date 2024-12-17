<script lang="ts">
    import { onMount } from "svelte";
    import { polyfill } from "mobile-drag-drop";
    import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";

    import { gameState } from "$lib/game.svelte";
    import CardSlot from "$lib/cardslot.svelte";

    onMount(() => {
        polyfill({
            dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
        });
    });
    const flipOptions = { duration: 300 };
</script>

<svelte:window on:dragenter={(event) => event.preventDefault()} on:touchmove={() => {}} />

<div class="flex min-h-screen justify-center bg-amber-100 dark:bg-gray-900">
    <div class="flex w-screen max-w-screen-md flex-col justify-between rounded-lg bg-slate-500 p-2 sm:m-8 sm:p-4">
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
        <div class="flex justify-center gap-1 sm:gap-2">
            <button
                class="my-auto h-12 w-24 shrink-0 rounded border-4 border-red-600 bg-amber-400 text-base font-black text-gray-900 disabled:opacity-25 sm:mr-8 sm:h-16 sm:w-32 sm:text-xl"
                >STRESS</button
            >
            {#each gameState.piles as card}
                <CardSlot {card} />
            {/each}
            <button
                class="my-auto h-12 w-24 shrink-0 rounded border-4 border-red-600 bg-amber-400 text-base font-black text-gray-900 disabled:opacity-25 sm:ml-8 sm:h-16 sm:w-32 sm:text-xl"
                >STRESS</button
            >
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
