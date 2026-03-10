<script lang="ts">
    import { cn } from '@/utils/cn'

    const LOBBY_STATE = ['selectingAudio', 'selectingLyric', 'playing'] as const
    interface Props {
      state?: typeof LOBBY_STATE[number]
      className?: string
      winnerName?: string
    }

    const { className, state, winnerName }: Props = $props()

    const stateText = $derived.by(() => {
      switch (state) {
        case "selectingAudio":
          return `Winner user $${winnerName ?? "unknown"} selecting audio`
        case "selectingLyric":
          return "Winner selecting lyric"
        default:
          return "Select your song and lyrics"
      }
    })
</script>

<div class={cn(className, 'flex justify-center gap-2')}>
    <span class="loading loading-dots loading-md text-warning"></span>

    <span class="text-2xl text-warning">
        { stateText }
    </span>
</div>