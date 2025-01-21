<script lang="ts">
    import { animation } from "$lib/game.svelte";
    const { opponent } = $props();
    const cardWidth = 2.25;
    const cardHeight = 3.5;
    const anim = animation[opponent ? "opponent" : "player"];
</script>

<div
    id={`${opponent ? "opponent" : "player"}FlipFake`}
    style="--card-x: {(anim.number - 1) * cardWidth}in; --card-y: {anim.color * cardHeight}in; left: {anim.fromX}px; top: {anim.fromY}px;"
    class:invisible={!anim.playing || !anim.flipped}
    class="card card-small sm:card-large fixed shrink-0 bg-no-repeat"
></div>
<div
    id={`${opponent ? "opponent" : "player"}UnflipFake`}
    style="--card-x: {9 * cardWidth}in; --card-y: 0in; left: {anim.fromX}px; top: {anim.fromY}px;"
    class:invisible={!anim.playing || anim.flipped}
    class="card card-small sm:card-large fixed shrink-0 bg-no-repeat"
></div>
