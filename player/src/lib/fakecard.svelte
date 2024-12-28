<script lang="ts">
    import { animation } from "$lib/game.svelte";
    const { opponent } = $props();
    const cardWidth = 2.25;
    const cardHeight = 3.5;
    const anim = animation[opponent ? "opponent" : "player"];
</script>

<div
    id={`${opponent ? "opponent" : "player"}Fake`}
    style="--card-x: {(anim.number - 1) * cardWidth}in; --card-y: {anim.color * cardHeight}in; left: {anim.fromX}px; top: {anim.fromY}px;"
    class:-z-10={!anim.playing}
    class="card card-small sm:card-large fixed shrink-0 bg-auto bg-no-repeat"
>
    <p>fake</p>
</div>

<style>
    @tailwind components;
    @layer components {
        .card {
            background-image: url("/eustress_deck.svg");
        }
        .card-small {
            width: 0.675in;
            height: 1.05in;
            background-size: 6.75in 4.2in;
            background-position: calc(var(--card-x) * -0.3) calc(var(--card-y) * -0.3);
        }
        .card-large {
            width: 1.125in;
            height: 1.75in;
            background-size: 11.25in 7in;
            background-position: calc(var(--card-x) * -0.5) calc(var(--card-y) * -0.5);
        }
    }
</style>
