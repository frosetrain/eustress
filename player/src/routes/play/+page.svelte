<script lang="ts">
    import { onMount } from "svelte";
    import { polyfill } from "mobile-drag-drop";
    import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
    import { websocket, joinKey, gameState, SlotType, player, selected, moveCard, moving, gameOngoing, onAffirm } from "$lib/game.svelte";
    import CardSlot from "$lib/cardslot.svelte";
    import { goto } from "$app/navigation";
    import FakeCard from "$lib/fakecard.svelte";

    let newSelected = { slotType: 0, slotId: 0 };

    function updateSelected() {
        if (newSelected.slotType === SlotType.playerDecks) {
            if (gameState.playerStacks.every((x) => x.count > 0)) {
                return;
            }
            gameState.playerDecks[0] = gameState.playerDecks[0].copy({ flipped: true });
        }
        selected.slotType = newSelected.slotType;
        selected.slotId = newSelected.slotId;
    }

    function onKeyPress(event: KeyboardEvent) {
        if (!gameOngoing.value || moving.player) {
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

        if (!selected.active) {
            if (newSelected.slotType !== SlotType.piles) {
                // select a new card
                selected.active = true;
                updateSelected();
            }
        } else if (selected.slotType === newSelected.slotType && selected.slotId === newSelected.slotId) {
            // if same card is selected again, deselect
            selected.active = false;
        } else if (selected.slotType === SlotType.playerDecks && newSelected.slotType === SlotType.playerStacks) {
            // move card from deck to stack
            moveCard(false, selected.slotType, selected.slotId, newSelected.slotType, newSelected.slotId);
            selected.active = true;
            updateSelected();
        } else if (
            newSelected.slotType === SlotType.piles &&
            (selected.slotType === SlotType.playerStacks || selected.slotType === SlotType.playerDecks)
        ) {
            // move card from stack to pile
            // check number
            moveCard(false, selected.slotType, selected.slotId, newSelected.slotType, newSelected.slotId);
            selected.active = false;
            updateSelected();
        } else {
            // if invalid, select the new selected card
            selected.active = true;
            updateSelected();
        }
    }

    function flipPlayer(cardType: number): number {
        switch (cardType) {
            case 0:
                return 1;
            case 1:
                return 0;
            case 2:
                return 2;
            case 3:
                return 4;
            case 4:
                return 3;
        }
        return 0;
    }

    onMount(() => {
        if (joinKey.value === 0) {
            goto("/");
        }
        websocket.onmessage = ({ data }) => {
            console.log(data);
            const args = data.split(" ");
            const command = args[0];
            switch (command) {
                case "begin":
                    gameOngoing.value = true;
                    gameState.playerDecks[0] = gameState.playerDecks[0].copy({
                        color: Number(args[1]),
                        number: Number(args[2]),
                    });
                    gameState.opponentDecks[0] = gameState.opponentDecks[0].copy({
                        color: Number(args[3]),
                        number: Number(args[4]),
                    });
                    break;
                case "affirm":
                    onAffirm.value(Number(args[1]), Number(args[2]), Number(args[3]));
                    onAffirm.value = (arg1: number, arg2: number, arg3: number) => {};
                    break;
                case "negative":
                    // show error
                    onAffirm.value = (arg1: number, arg2: number, arg3: number) => {};
                    break;
                case "move":
                    const [
                        _,
                        fromTypeReal,
                        fromId,
                        toTypeReal,
                        toId,
                        movedColor,
                        movedNumber,
                        replacementColor,
                        replacementNumber,
                        opponentDeckCount,
                    ]: [number, number, number, number, number, number, number, number, number, number] = args.map((x: string) => Number(x));
                    // console.log(fromType, fromId, toType, toId, movedColor, movedNumber, replacementColor, replacementNumber, opponentDeckCount);
                    const fromType = player.value === 2 ? flipPlayer(fromTypeReal) : fromTypeReal;
                    const toType = player.value === 2 ? flipPlayer(toTypeReal) : toTypeReal;
                    const showMove = moveCard(true, fromType, fromId, toType, toId)!;
                    showMove(replacementColor, replacementNumber, opponentDeckCount);
                    break;
                default:
                    console.log("invalid command from server");
                    break;
            }
        };

        polyfill({
            dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
        });
    });
</script>

<svelte:window on:dragenter={(event) => event.preventDefault()} on:touchmove={() => {}} on:keypress|preventDefault={onKeyPress} />

<div class="flex min-h-dvh justify-center bg-amber-100 dark:bg-gray-900">
    <!-- <p class="text-white">{selected.active} {selected.slotType} {selected.slotId}</p> -->
    <div
        class="flex w-screen max-w-screen-md flex-col justify-between bg-gray-700 p-2 shadow-lg shadow-orange-600 ring-4 ring-orange-600/60 sm:m-8 sm:rounded-lg sm:p-4"
    >
        <!-- Other stacks -->
        <div class="flex justify-between gap-1">
            {#each gameState.opponentDecks as card}
                <CardSlot {card} />
            {/each}
            <div class="flex flex-row-reverse gap-1 sm:gap-2">
                {#each gameState.opponentStacks as card}
                    <CardSlot {card} />
                {/each}
            </div>
        </div>
        <div class="flex justify-evenly">
            <button id="amogus" class="my-auto rounded bg-orange-400 px-4 py-2.5 text-lg font-black text-gray-900 disabled:opacity-25"
                >STRESS <span class="font-normal">{joinKey.value}</span></button
            >
            <div class:flex-row-reverse={player.value === 2} class="flex gap-1 sm:gap-2">
                {#each gameState.piles as card}
                    <CardSlot {card} />
                {/each}
            </div>
            <button class="my-auto rounded bg-orange-400 px-4 py-2.5 text-lg font-black text-gray-900 disabled:opacity-25">STRESS</button>
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
<FakeCard opponent={false} />
<FakeCard opponent={true} />
