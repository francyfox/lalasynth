<script lang="ts">
import type { Lyrics } from './text-scroller.types.ts'

interface Props {
  song: Lyrics
  onError?: (error: string) => void
}

const { song, onError }: Props = $props();
const lyrics = $derived.by(() => song.plainLyrics || '')
// const splittedSong = $derived.by(() => lyrics.split("\n"))

let cursor = $state(0);
let mistakes = $state(0);
let typedPart = $derived(lyrics.slice(0, cursor));
let remainingPart = $derived(lyrics.slice(cursor).split("\n"));
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key.length !== 1) return;
  const targetChar = lyrics[cursor];

  if (e.key === targetChar) {
    cursor++;
  } else {
    if (onError) onError(e.key)
    mistakes++;
  }
};

$effect(() => {
  window.addEventListener('keydown', handleKeydown);

  return () => {
    window.removeEventListener('keydown', handleKeydown);
  };
});
</script>

<div class="my-auto py-5 text-scroller text-4xl text-center font-mono">
    <div class="overflow-y-auto flex justify-center">
        <div class="h-[80px]">
            <span class="text-orange-500">{typedPart}</span>
            {#if cursor < lyrics.length}
                {#each remainingPart.slice(1) as line}
                    <p class="text-zinc-500">{line}</p>
                {/each}
            {/if}

        </div>
    </div>


    <div class="mt-8 text-sm text-zinc-400">
        Mistakes: {mistakes} | Progress: {Math.round((cursor / song.plainLyrics?.length || 0) * 100)}%
    </div>
</div>

<style lang="postcss">
    .text-scroller {
        position: relative;
        background: linear-gradient(90deg,rgba(0, 0, 0, 0) 0%, color-mix(in oklch, var(--color-base-200), transparent 5%) 20%, color-mix(in oklch, var(--color-base-200), transparent 5%) 80%, rgba(0, 0, 0, 0) 100%);
    }
</style>