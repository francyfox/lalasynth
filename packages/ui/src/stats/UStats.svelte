<script lang="ts">
interface Props {
  cpu: number
  memory: number
  totalMemory: number
  totalPlayers: number
  lobbyPlayers: number
  activePlayers: number
  limit?: number
  db: {
    write: number
    read: number
    storage: number
  }
}
</script>

<div class="z-10 stats absolute bottom-20 right-5 w-full max-w-[200px] flex flex-col gap-5 p-5 bg-base-300/90 rounded-lg">

</div>