<script lang="ts">
import { useEventListener } from 'runed'
import { cn } from '../utils.js'

interface Props {
  className: string
  cpu?: number
  memory?: number
  totalPlayers?: number
  lobbyPlayers?: number
  activePlayers?: number
  limit?: number
  turso?: {
    write: number
    read: number
    storage: number
  },
  onShortcut?: () => void
}

const { turso, onShortcut, className, ...stats }: Props = $props()

const data = $derived.by(() => {
  return [
    ...Object.entries(stats),
    ...Object.entries(turso).map(([i, v]) => [`t-${i}`, v]),
  ]
})

useEventListener(
  () => window,
  "keydown",
  (e) => {
    const isS = e.key.toLowerCase() === "s";
    const isModifier = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    console.log(isS, isModifier, isShift)

    if (isS && isModifier && isShift) {
      e.preventDefault();
      if (onShortcut) onShortcut();
    }
  }
);
</script>

<div class={cn("z-10 stats absolute bottom-20 right-5 w-full max-w-[260px] flex flex-col gap-2 p-5 bg-base-300/90 rounded-lg", className)}>
    <div class="flex justify-between items-center gap-2">
        <span class="text-xl">Stats</span>
        <div class="type-hint text-base">
            <span class="kbd kbd-sm">⌘</span>
            +
            <span class="kbd kbd-sm">Shift</span>
            +
            <span class="kbd kbd-sm">S</span>
        </div>
    </div>

    <hr>

    <div class="flex flex-col gap-2">
        {#each data as [key, value]}
        <div class="flex gap-2 items-center">
            <span class="w-[100px]">{ key }</span>
            <progress class="progress w-56" value={!Number.isFinite(value) ? 0 : value} max="100"></progress>
        </div>
        {/each}
    </div>
</div>