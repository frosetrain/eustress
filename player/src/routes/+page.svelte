<script lang="ts">
    import { dndzone } from "svelte-dnd-action";
    import Card from "$lib/card.svelte";
    let items = [
        { id: 1, name: "item1" },
        { id: 2, name: "item2" },
        { id: 3, name: "item3" },
        { id: 4, name: "item4" },
    ];
</script>

<div class="flex min-h-screen justify-center bg-gray-900">
    <div class="flex w-screen max-w-screen-md flex-col justify-between bg-blue-800 p-2 sm:m-8 sm:p-4">
        <!-- Other stacks -->
        <div class="flex justify-between gap-1">
            <Card color="0" number="7" canDrag="false" />
            <div class="flex gap-1 sm:gap-2">
                <Card color="0" number="7" canDrag="false" />
                <Card color="1" number="2" canDrag="false" />
                <Card color="2" number="9" canDrag="false" />
                <Card color="3" number="1" canDrag="false" />
            </div>
        </div>
        <div class="flex justify-center gap-1 sm:gap-2">
            <button disabled class="my-auto h-12 w-24 shrink-0 rounded border-4 border-red-600 bg-amber-400 text-base font-black text-gray-900 disabled:opacity-25 sm:mr-8 sm:h-16 sm:w-32 sm:text-xl"
                >STRESS</button
            >
            <Card color="2" number="3" canDrag="false" />
            <Card color="3" number="4" canDrag="false" />
            <button class="my-auto h-12 w-24 shrink-0 rounded border-4 border-red-600 bg-amber-400 text-base font-black text-gray-900 disabled:opacity-25 sm:ml-8 sm:h-16 sm:w-32 sm:text-xl"
                >STRESS</button
            >
        </div>
        <!-- Player stacks -->
        <div class="flex justify-between gap-1">
            <div use:dndzone={{ items }} class="flex gap-1 sm:gap-2">
                <Card color="0" number="7" canDrag="true" />
                <Card color="1" number="2" canDrag="true" />
                <Card color="2" number="9" canDrag="true" />
                <Card color="0" number="1" canDrag="true" />
            </div>
            <Card color="3" number="7" canDrag="true" />
        </div>
    </div>
</div>
