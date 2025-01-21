<script lang="ts">
    import { goto } from "$app/navigation";
    import { websocket, joinKey, player } from "$lib/game.svelte";

    let value = $state("");
    let websocketConnected: boolean | null = $state(null);
    let class1 = $state("bg-amber-900 text-amber-200");
    let class2 = $state("bg-amber-500");
    let connectedString = $state("Connecting…");
    let startLoading = $state(false);
    let joinLoading = $state(false);

    websocket.onopen = () => {
        websocketConnected = true;
        class1 = "bg-green-900 text-green-200";
        class2 = "bg-green-500";
        connectedString = "Connected";
    };
    function websocketFailed() {
        websocketConnected = false;
        class1 = "bg-red-900 text-red-200";
        class2 = "bg-red-500";
        connectedString = "Connection failed";
    }
    websocket.onerror = websocketFailed;
    websocket.onclose = websocketFailed;

    function start() {
        startLoading = true;
        websocket.onmessage = ({ data }) => {
            joinKey.value = Number(data);
            player.value = 1;
            websocket.onmessage = null;
            goto(`/play`);
        };
        websocket.send("start");
    }

    function join() {
        joinLoading = true;
        websocket.onmessage = ({ data }) => {
            if (data == "affirm") {
                joinKey.value = Number(value);
                player.value = 2;
                websocket.onmessage = null;
                goto(`/play`);
            }
        };
        websocket.send(`join ${value}`);
    }
</script>

<div class="h-dvh bg-gray-100 dark:bg-gray-900">
    <div class="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <div class="mb-4 flex items-center text-3xl font-extrabold text-gray-900 dark:text-white">
            <!-- <img class="mr-2 h-8 w-8" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" /> -->
            Eustress
        </div>
        <span class="mb-6 inline-flex items-center rounded-full bg-gray-700 pl-3 text-xs font-medium text-white">
            Server
            <span class={"ml-2 inline-flex items-center rounded-full px-2.5 py-1 " + class1}>
                <span class={"me-1.5 h-2 w-2 rounded-full " + class2}></span>
                {connectedString}
            </span>
        </span>
        <div class="w-full rounded-lg bg-white shadow sm:max-w-md md:mt-0 xl:p-0 dark:border dark:border-gray-700 dark:bg-gray-800">
            <div class="space-y-8 p-6 sm:p-8">
                <div class="space-y-3">
                    <h1 class="text-xl font-bold leading-tight text-gray-900 dark:text-white">Start a new game</h1>
                    <button
                        onclick={start}
                        class="text-ms w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        {#if startLoading}
                            Loading…
                        {:else}
                            Start game
                        {/if}
                    </button>
                </div>
                <div class="space-y-3">
                    <h1 class="text-xl font-bold leading-tight text-gray-900 dark:text-white">Join an existing game</h1>
                    <div class="flex w-full gap-2">
                        <input
                            bind:value
                            id="joinKey"
                            type="text"
                            placeholder="Game code"
                            class="block w-28 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                        <button
                            onclick={join}
                            class="text-ms flex-none rounded-lg bg-blue-600 px-5 py-2.5 text-center font-medium text-white transition hover:bg-blue-700 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700"
                            >{#if joinLoading}
                                Loading…
                            {:else}
                                Join game
                            {/if}</button
                        >
                    </div>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Are you confused? <a href="/instructions" class="font-semibold text-blue-600 underline hover:underline dark:text-blue-400"
                        >Instructions</a
                    >
                </p>
            </div>
        </div>
    </div>
</div>
