<script lang="ts">
    let { color, number, canDrag } = $props();
    const cardWidth = 2.25;
    const cardHeight = 3.5;
</script>

<div style="--card-x: {(number - 1) * cardWidth}in; --card-y: {color * cardHeight}in" class="card-small sm:card-large shrink-0 bg-auto bg-no-repeat"></div>

<style>
    @tailwind components;
    @layer components {
        .card-small {
            background-image: url("/eustress_deck.svg");
            width: 0.675in;
            height: 1.05in;
            background-size: 6.075in 4.2in;
            background-position: calc(var(--card-x) * -0.3) calc(var(--card-y) * -0.3);
        }
        .card-large {
            background-image: url("/eustress_deck.svg");
            width: 1.125in;
            height: 1.75in;
            background-size: 10.125in 7in;
            background-position: calc(var(--card-x) * -0.5) calc(var(--card-y) * -0.5);
        }
    }
</style>
