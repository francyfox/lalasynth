<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount, type Snippet } from 'svelte';

  interface Props {
    scenes: Snippet[];
    duration?: number;
    after?: () => void;
  }

  let { scenes, duration = 1000, after }: Props = $props();
  let currentIndex = $state(0);

  const outDuration = 400;
  const inDuration = 600;

  onMount(() => {
    const timer = setInterval(() => {
      if (currentIndex < scenes.length - 1) {
        currentIndex++;
      } else {
        clearInterval(timer);
        if (after) after();
      }
    }, duration + inDuration + outDuration); // Увеличиваем цикл на время анимаций

    return () => clearInterval(timer);
  });
</script>

<div class="host">
    {#key currentIndex}
        <div class="scene"
             out:fade={{ duration: outDuration }}
             in:fade={{ duration: inDuration, delay: outDuration }}
        >
        {#if scenes[currentIndex]}
            {@render scenes[currentIndex]()}
        {/if}
        </div>
    {/key}
</div>

<style>
    .host {
        position: relative;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #282a36;
    }

    .scene {
        position: absolute;
    }
</style>