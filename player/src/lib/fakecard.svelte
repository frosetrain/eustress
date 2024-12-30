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
