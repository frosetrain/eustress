<script lang="ts">
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { send, receive } from "$lib/transition";
    import Card from "$lib/card.svelte";
    import { polyfill } from "mobile-drag-drop";
    import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";

    onMount(() => {
        polyfill({
            dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
        });
    });

    const flipOptions = { duration: 300 };
    let playerStacks = $state([
        { type: 0, color: 0, number: 7, count: 4 },
        { type: 0, color: 1, number: 6, count: 3 },
        { type: 0, color: 2, number: 5, count: 2 },
        { type: 0, color: 3, number: 4, count: 1 },
    ]);
    let piles = $state([
        { type: 0, color: 2, number: 3, count: 12 },
        { type: 0, color: 3, number: 3, count: 34 },
    ]);
</script>

<svelte:window on:dragenter={(event) => event.preventDefault()} on:touchmove={() => {}} />

<div class="flex min-h-screen justify-center bg-amber-100 dark:bg-gray-900">
    <div class="flex w-screen max-w-screen-md flex-col justify-between rounded-lg bg-slate-500 p-2 sm:m-8 sm:p-4">
        <!-- Other stacks -->
        <div class="flex justify-between gap-1">
            <Card type={1} color={0} number={7} />
            <div class="flex gap-1 sm:gap-2">
                <Card type={0} color={0} number={7} />
                <Card type={0} color={1} number={2} />
                <Card type={0} color={2} number={8} />
                <Card type={0} color={0} number={2} />
            </div>
        </div>
        <div class="flex justify-center gap-1 sm:gap-2">
            <button disabled class="my-auto h-12 w-24 shrink-0 rounded border-4 border-red-600 bg-amber-400 text-base font-black text-gray-900 disabled:opacity-25 sm:mr-8 sm:h-16 sm:w-32 sm:text-xl"
                >STRESS</button
            >
            {#each piles as c (c)}
                <div in:receive={{ key: c }} out:send={{ key: c }} animate:flip={flipOptions}>
                    <Card type={c.type} color={c.color} number={c.number} canDrop={true} />
                </div>
            {/each}
            <button
                onclick={() => {
                    piles.splice(0, 1, playerStacks.splice(Math.floor(Math.random() * 4), 1, { type: 0, color: 0, number: 1, count: 4 })[0]);
                }}
                class="my-auto h-12 w-24 shrink-0 rounded border-4 border-red-600 bg-amber-400 text-base font-black text-gray-900 disabled:opacity-25 sm:ml-8 sm:h-16 sm:w-32 sm:text-xl">STRESS</button
            >
        </div>
        <!-- Player stacks -->
        <div class="flex justify-between gap-1">
            <div class="flex gap-1 sm:gap-2">
                {#each playerStacks as c (c)}
                    <div in:receive={{ key: c }} out:send={{ key: c }} animate:flip={flipOptions}>
                        <Card type={c.type} color={c.color} number={c.number} canDrag={true} canDrop={true} />
                    </div>
                {/each}
            </div>
            <Card type={1} color={3} number={7} canDrag={true} />
        </div>
    </div>
</div>
