<script lang="ts">
    import { goto } from "$app/navigation";
    import { websocket, joinKey } from "$lib/game.svelte";

    let value = $state("");

    function start() {
        websocket.onmessage = ({ data }) => {
            joinKey.value = Number(data);
            websocket.onmessage = null;
            goto(`/play`);
        };
        websocket.send("start");
    }

    function join() {
        websocket.onmessage = ({ data }) => {
            if (data == "affirm") {
                joinKey.value = Number(value);
                websocket.onmessage = null;
                goto(`/play`);
            }
        };
        websocket.send(`join ${value}`);
    }
</script>

<div class="mx-auto my-4 max-w-screen-md px-4">
    <p class="text-3xl font-bold">Eustress</p>
    <button onclick={start} class="mt-4 block w-fit rounded bg-blue-600 p-2 text-white shadow-md">Start new game</button>
    <button onclick={join} class="mr-4 mt-4 inline-block w-fit rounded bg-blue-600 p-2 text-white shadow-md">Join game</button>
    <label for="joinKey">Game code:</label>
    <input bind:value id="joinKey" type="text" class="border border-black" />
</div>
