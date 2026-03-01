<script lang="ts">
import type { Lyrics } from './text-scroller.types.ts'

interface Props {
  song: Lyrics
  onError?: (error: string) => void
  isPlaying: boolean
}

const { song, isPlaying = true, onError }: Props = $props();
const lyrics = $derived.by(() => song.plainLyrics?.split("\n") || '')

let currentLineIdx = $state(0)
let cursor = $state(0);
let mistakes = $state(0);
let key = $state('')
let isWrong = $state(false)

let progress = $derived.by(() => {
  const match = song.plainLyrics?.match(`^(?:.*\\n){${currentLineIdx}}`)
  const idx = match[0].length + cursor
  return match ? Math.round((idx / song.plainLyrics?.length) * 100) : 0;
})

let startTime = $state(0);
let currentTime = $state(0);

let wpm = $derived.by(() => {
  const match = song.plainLyrics?.match(`^(?:.*\\n){${currentLineIdx}}`)
  const correctChars = match[0].length + cursor

  if (!startTime || currentTime <= startTime) return 0;

  const timeInMinutes = (currentTime - startTime) / 1000 / 60;
  const words = correctChars / 5;

  return Math.round(words / timeInMinutes) || 0;
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key.length !== 1) return;
  const targetChar = lyrics[currentLineIdx][cursor];
  key = e.key;

  if (e.key === targetChar) {
    isWrong = false;
    cursor++;

    if (cursor === lyrics[currentLineIdx].length) {
      cursor = 0;
      currentLineIdx += 1;
    }
  } else {
    if (onError) onError(e.key)
    mistakes++;
    isWrong = true;
  }
};

function getCharClasses(lineI: number, charI: number): string {
  const isPastLine = lineI < currentLineIdx;
  const isCurrentLine = lineI === currentLineIdx;
  const isUpcomingLine = lineI > currentLineIdx;
  const isTyped = isPastLine || (isCurrentLine && charI < cursor);
  const isCurrentChar = isCurrentLine && charI === cursor;

  return [
    "relative inline-flex w-[1ch] justify-center transition-all duration-150 ease-in-out",
    isTyped
      ? "text-orange-500 [text-shadow:0_0_12px_rgba(249,115,22,0.6)]"
      : "text-zinc-100",
    isCurrentChar
      ? "text-zinc-100 scale-110 font-bold"
      : "scale-100",
    isUpcomingLine ? "opacity-100" : "opacity-100"
  ].join(" ");
}

$effect(() => {
  if (isPlaying && startTime === 0) {
    startTime = Date.now();
  }

  if (isPlaying) {
    const interval = setInterval(() => {
      currentTime = Date.now();
    }, 100);
    return () => clearInterval(interval);
  }
});

$effect(() => {
  window.addEventListener('keydown', handleKeydown);

  return () => {
    window.removeEventListener('keydown', handleKeydown);
  };
});
</script>

<div class="my-auto py-5 text-scroller text-4xl text-center font-mono">
    <div class="relative flex justify-center">
        {#if isWrong}
            <kbd class="absolute top-[-80px] kbd kbd-xl">{key}</kbd>
        {/if}
    </div>

    <div class="overflow-hidden flex justify-center">
        <div class="h-[100px]">
            {#each lyrics as line, i}
                {#if i === currentLineIdx || i === currentLineIdx + 1}
                    <p
                            class="flex flex-wrap text-5xl leading-none transition-color duration-50"
                            class:opacity-100={i === currentLineIdx}
                            class:opacity-20={i !== currentLineIdx}
                    >
                        {#each line as char, sIdx}
                          <span class={getCharClasses(i, sIdx)}>
                            {char}

                              {#if i === currentLineIdx && sIdx === cursor}
                              <span class="absolute -bottom-0 left-0 h-[4px] w-full bg-orange-400
                                           shadow-[0_0_20px_#fb923c] animate-pulse"></span>
                            {/if}
                          </span>
                        {/each}
                    </p>
                {/if}
            {/each}
        </div>
    </div>


    <div class="mt-8 text-sm text-zinc-400">
        Mistakes: {mistakes} | Progress: {progress}% | WPM: {wpm}
    </div>
</div>

<style lang="postcss">
    .text-scroller {
        position: relative;
        background: linear-gradient(90deg,rgba(0, 0, 0, 0) 0%, color-mix(in oklch, var(--color-base-200), transparent 5%) 20%, color-mix(in oklch, var(--color-base-200), transparent 5%) 80%, rgba(0, 0, 0, 0) 100%);
    }
</style>