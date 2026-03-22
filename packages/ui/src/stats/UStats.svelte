<script lang="ts">
import { cn } from '../utils.js'

interface Props {
  className?: string
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
  }
}

const { turso, className = '', ...stats }: Props = $props()

const data = $derived.by(() => {
  return [
    ...Object.entries(stats),
    ...(turso ? Object.entries(turso).map(([i, v]) => [`t-${i}`, v]) : []),
  ]
})
</script>

<div class={cn("z-10 stats absolute bottom-20 right-5 w-full max-w-[260px] flex flex-col gap-2 p-5 bg-base-300/90 rounded-lg", className)}>
    <div class="flex justify-between items-center gap-2">
        <span class="text-xl">Stats</span>
    </div>

    <hr>

    <div class="flex flex-col gap-2">
        {#each data as [key, value] (key)}
        <div class="flex gap-2 items-center">
            <span class="w-[100px]">{ key }</span>
            <progress class="progress w-[80px]" value={!Number.isFinite(value) ? 0 : value} max="100">
            </progress>
            <span class="w-10 overflow-hidden">{ !Number.isFinite(value) ? 0 : value }</span>
        </div>
        {/each}
    </div>
</div>