<script lang="ts">
    import { onMount } from "svelte";
    import { polyfill } from "mobile-drag-drop";
    import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
    import {
        websocket,
        joinKey,
        gameState,
        playAnimation,
        SlotType,
        player,
        selected,
        moveCard,
        gameSetup,
        gameStarted,
        onAffirm,
    } from "$lib/game.svelte";
    import { showShout } from "$lib/shout.svelte";
    import CardSlotComponent from "$lib/cardslot.svelte";
    import { goto } from "$app/navigation";
    import FakeCard from "$lib/fakecard.svelte";

    let newSelected = { slotType: 0, slotId: 0 };
    let stressPressed = $state([false, false]);
    let winScreen = $state(0);

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

    function onKeyDown(event: KeyboardEvent) {
        const stressKeys = ["ShiftLeft", "ShiftRight"];
        if (stressKeys.includes(event.code)) {
            const shiftId = stressKeys.indexOf(event.code);
            stressPressed[shiftId] = true;
            stress();
        }
    }

    function onKeyPress(event: KeyboardEvent) {
        if (!gameSetup.value) {
            return;
        }
        const stackKeys = "asdf";
        const pileKeys = player.value === 1 ? "jk" : "kj";
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
        stressPressed = [false, false];

        if (!selected.active) {
            if (newSelected.slotType !== SlotType.piles) {
                // select a new card
                selected.active = true;
                updateSelected();
            }
        } else if (selected.slotType === newSelected.slotType && selected.slotId === newSelected.slotId) {
            // if same card is selected again, deselect
            selected.active = false;
        } else if (
            selected.slotType === newSelected.slotType &&
            selected.slotType === SlotType.playerStacks &&
            gameState.playerStacks[selected.slotId].number === gameState.playerStacks[newSelected.slotId].number
        ) {
            // move card from stack to stack (if number is the same)
            moveCard(false, selected.slotType, selected.slotId, newSelected.slotType, newSelected.slotId);
            selected.active = true;
            updateSelected();
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

    function stress0() {
        // showShout("Hello darkness my old friend", false, false);
        stressPressed[0] = true;
        stress();
    }
    function stress1() {
        // showShout("This is a warning warning.", true, true);
        stressPressed[1] = true;
        stress();
    }
    function stress() {
        if (!gameStarted.value) {
            stressPressed = [false, false];
            return;
        }
        if (!stressPressed.every((e) => e)) {
            return;
        }
        websocket.send("stress");
    }

    onMount(() => {
        if (joinKey.value === 0) {
            goto("/");
        }
        websocket.onmessage = ({ data }) => {
            console.debug(data);
            const args = data.split(" ");
            const command = args[0];
            switch (command) {
                case "setup":
                    gameSetup.value = true;
                    gameState.playerDecks[0] = gameState.playerDecks[0].copy({
                        color: Number(args[1]),
                        number: Number(args[2]),
                    });
                    gameState.opponentDecks[0] = gameState.opponentDecks[0].copy({
                        color: Number(args[3]),
                        number: Number(args[4]),
                    });
                    break;
                case "begin":
                    gameStarted.value = true;
                    stressPressed = [false, false];
                    // Move the top card in each deck to a pile
                    if (player.value == 2) {
                        [args[2], args[3], args[4], args[5]] = [args[4], args[5], args[2], args[3]];
                    }
                    moveCard(false, SlotType.playerDecks, 0, SlotType.piles, player.value === 1 ? 0 : 1, true)!(Number(args[2]), Number(args[3]));
                    moveCard(true, SlotType.opponentDecks, 0, SlotType.piles, player.value === 1 ? 1 : 0, true)!(Number(args[4]), Number(args[5]));
                    break;
                case "stuck":
                    switch (Number(args[1])) {
                        case 0:
                            if (player.value == 2) {
                                [args[2], args[3], args[4], args[5]] = [args[4], args[5], args[2], args[3]];
                            }
                            console.debug("stuck 0");
                            moveCard(false, SlotType.playerDecks, 0, SlotType.piles, player.value === 1 ? 0 : 1, true)!(
                                Number(args[2]),
                                Number(args[3]),
                            );
                            moveCard(true, SlotType.opponentDecks, 0, SlotType.piles, player.value === 1 ? 1 : 0, true)!(
                                Number(args[4]),
                                Number(args[5]),
                            );
                            break;
                        case 1:
                            console.debug("stuck 1");
                            moveCard(false, player.value === 1 ? SlotType.playerDecks : SlotType.opponentDecks, 0, SlotType.piles, 0, true)!(
                                Number(args[2]),
                                Number(args[3]),
                            );
                            moveCard(true, player.value === 1 ? SlotType.playerDecks : SlotType.opponentDecks, 0, SlotType.piles, 1, true)!(
                                Number(args[4]),
                                Number(args[5]),
                            );
                            break;
                        case 2:
                            console.debug("stuck 2");
                            moveCard(false, player.value === 1 ? SlotType.opponentDecks : SlotType.playerDecks, 0, SlotType.piles, 0, true)!(
                                Number(args[2]),
                                Number(args[3]),
                            );
                            moveCard(true, player.value === 1 ? SlotType.opponentDecks : SlotType.playerDecks, 0, SlotType.piles, 1, true)!(
                                Number(args[4]),
                                Number(args[5]),
                            );
                            break;
                    }
                    break;
                case "affirm":
                    onAffirm.queue.shift()!(Number(args[1]), Number(args[2]), Number(args[3]));
                    break;
                case "negative":
                    // show error
                    onAffirm.queue.shift();
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
                    // console.debug(fromType, fromId, toType, toId, movedColor, movedNumber, replacementColor, replacementNumber, opponentDeckCount);
                    const fromType = player.value === 2 ? flipPlayer(fromTypeReal) : fromTypeReal;
                    const toType = player.value === 2 ? flipPlayer(toTypeReal) : toTypeReal;
                    const showMove = moveCard(true, fromType, fromId, toType, toId)!;
                    showMove(replacementColor, replacementNumber, opponentDeckCount);
                    break;
                case "invalidStress":
                    stressPressed = [false, false];
                    break;
                case "stressed":
                    const stressWon = args[1] === "true";
                    const loserDeckCount = Number(args[2]);
                    const loserType = stressWon ? "opponentDecks" : "playerDecks";
                    console.debug("stressed", loserDeckCount, loserType, gameState[loserType]);
                    gameState[loserType][0] = gameState[loserType][0].copy({ count: loserDeckCount });
                    gameState.piles[0] = gameState.piles[0].copy({ count: 0 });
                    gameState.piles[1] = gameState.piles[1].copy({ count: 0 });

                    playAnimation(
                        SlotType.piles,
                        0,
                        stressWon ? SlotType.opponentDecks : SlotType.playerDecks,
                        0,
                        gameState.piles[0].color,
                        gameState.piles[0].number,
                        false,
                        false,
                        () => {},
                    );
                    playAnimation(
                        SlotType.piles,
                        1,
                        stressWon ? SlotType.opponentDecks : SlotType.playerDecks,
                        0,
                        gameState.piles[1].color,
                        gameState.piles[1].number,
                        true,
                        false,
                        () => {},
                    );
                    break;
                case "game":
                    const gameWon = args[1] === "true";
                    if (gameWon) {
                        winScreen = 1;
                    } else {
                        winScreen = 2;
                    }
                    gameStarted.value = false;
                    gameSetup.value = false;
                    break;
                default:
                    console.warn("invalid command from server");
                    break;
            }
        };

        polyfill({
            dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
        });
    });
</script>

<svelte:window
    on:dragenter={(event) => event.preventDefault()}
    on:touchmove={() => {}}
    on:keypress|preventDefault={onKeyPress}
    on:keydown={onKeyDown}
/>

<div class="flex min-h-dvh justify-center bg-white dark:bg-gray-900">
    <div
        class="relative flex w-screen max-w-screen-md flex-col justify-between bg-gray-200 p-2 shadow-orange-500/50 sm:m-8 sm:rounded-lg sm:p-4 dark:bg-gray-700"
        style="box-shadow: inset 0 0 6px 6px var(--tw-shadow-color);"
    >
        <!-- <p class="text-white">{selected.active} {selected.slotType} {selected.slotId}</p> -->
        <!-- <p class="text-white">
            gameSetup {gameSetup.value}; gameStarted {gameStarted.value}; moving {moving.player} animation.player {animation.player.playing} animation.opponent
            {animation.opponent.playing}
        </p> -->
        <!-- <p class="text-white">{onAffirm.queue.length}</p> -->
        <!-- Other stacks -->
        <div class="flex justify-between gap-1 rounded-lg p-1.5 sm:rounded-2xl sm:p-3">
            {#each gameState.opponentDecks as card}
                <CardSlotComponent {card} />
            {/each}
            <div class="flex flex-row-reverse gap-1 sm:gap-2">
                {#each gameState.opponentStacks as card}
                    <CardSlotComponent {card} />
                {/each}
            </div>
        </div>
        <div class="flex justify-evenly">
            <button
                onclick={stress0}
                class:ring-8={stressPressed[0]}
                class="my-auto rounded bg-orange-500 px-4 py-2.5 text-lg font-black text-gray-900 shadow-md shadow-gray-900/40 ring-red-600 disabled:opacity-25"
                >STRESS</button
            >
            <div class:flex-row-reverse={player.value === 2} class="flex gap-1 sm:gap-2">
                {#each gameState.piles as card}
                    <CardSlotComponent {card} />
                {/each}
            </div>
            <button
                onclick={stress1}
                class:ring-8={stressPressed[1]}
                class="my-auto rounded bg-orange-500 px-4 py-2.5 text-lg font-black text-gray-900 shadow-md shadow-gray-900/40 ring-red-600 disabled:opacity-25"
                >STRESS</button
            >
        </div>
        <!-- Player stacks -->
        <div class="flex justify-between gap-1 rounded-lg bg-orange-500 p-1.5 shadow-md shadow-gray-900/30 sm:rounded-2xl sm:p-3 dark:bg-orange-700">
            <div class="flex gap-1 sm:gap-2">
                {#each gameState.playerStacks as card}
                    <CardSlotComponent {card} />
                {/each}
            </div>
            {#each gameState.playerDecks as card}
                <CardSlotComponent {card} />
            {/each}
        </div>
        <div
            id="opponentShout"
            class="absolute left-1/2 top-1/3 grid h-20 w-full place-content-center px-4"
            style="transform: translate(-50%, -50%);"
        ></div>
        <div id="playerShout" class="absolute left-1/2 top-2/3 grid h-20 w-full place-content-center px-4" style="transform: translate(-50%, -50%);">
            <p class="text-gray-700 dark:text-gray-200">Click on your deck, then drag the card to one of your stacks.</p>
        </div>
    </div>
</div>

<FakeCard opponent={false} />
<FakeCard opponent={true} />

{#if !gameSetup.value && winScreen == 0}
    <div class="fixed left-0 top-0 grid h-dvh w-dvw place-content-center bg-gray-700/50">
        <div class="rounded-md bg-gray-800 p-8 text-center font-medium text-white shadow-lg shadow-orange-500/70 ring-4 ring-orange-500 sm:text-lg">
            <p>Game code: {joinKey.value}</p>
            <p>Waiting for other player…</p>
        </div>
    </div>
{/if}

{#if winScreen > 0}
    <div class="fixed left-0 top-0 grid h-dvh w-dvw place-content-center bg-gray-700/50">
        <div class="rounded-md bg-gray-800 p-8 text-center font-medium text-white shadow-lg shadow-orange-500/70 ring-4 ring-orange-500 sm:text-lg">
            {winScreen === 1 ? "You win!!!!" : "You lose! :("}
            <a href="/" data-sveltekit-reload class="bold mt-4 block rounded-md bg-blue-600 px-5 py-2.5 text-sm">Return to menu</a>
        </div>
    </div>
{/if}
