<script lang="ts">
  import type { ColumnDef } from '@tanstack/table-core'
  import UBadge from '../badge/UBadge.svelte'
  import UCounter from '../counter/UCounter.svelte'
  import UInput from '../input/UInput.svelte'
  import type { User } from '../../../../apps/api/src/modules/user/user.schema.ts'
  import type { Song } from '../../../../apps/api/src/modules/song/song.schema.ts'
  import { Debounced } from "runed";
  import UTable from '../table/UTable.svelte'

  interface Props {
    countdown?: number
    isWinner: boolean
    lobbyState: 'timer' | 'selected' | 'playing'
    selectedSong: Song;
    winner?: User
    lobbyUsers: User[]
    onUrlUpdate?: (v: string) => void
  }

  let {
    isWinner = false,
    winner,
    lobbyState = 'selected',
    countdown = $bindable(90),
    selectedSong,
    onUrlUpdate
  }: Props = $props()

  let url: string = $state('')
  let debouncedUrl = new Debounced(() => {
    if (onUrlUpdate) onUrlUpdate(url)
    return url
  }, 500);


  let users = $state<Partial<User>[]>([
    { id: '1', level: 10, email: 'fox@example.com' },
    { id: '2', level: 5, email: 'wolf@example.com' }
  ]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: (info) => ({ component: UBadge, props: { value: info.getValue() } })
    }
  ];
</script>

<div class="mx-auto w-full max-w-2xl p-5 bg-base-300/90 rounded-lg">
    {#if /selected|playing/.test(lobbyState)}
        <div class="flex justify-center">
            <UCounter {countdown} />
        </div>
    {/if}

    {#if lobbyState === 'timer' && isWinner && !selectedSong}
        <UInput
                label="Select a song"
                placeholder="Paste your song from youtube [url/id]"
                bind:value={url}
        />
    {/if}


    {#if lobbyState === 'timer' && !isWinner}
        <p class="hint text-2xl text-center text-gray-400">
            Only winner in last game can select a song <br>
            <span class="inline-flex gap-2 items-center">
                <span aria-label="status" class="status status-primary animate-bounce"></span>
                <span>User: <span class="text-warning">${winner?.name}</span> selecting a song...</span>
            </span>
        </p>
    {/if}

    {#if lobbyState === 'selected'}
        <p class="hint text-4xl text-center text-primary font-bold">
            Get ready for the next battle
        </p>
    {/if}

    <UTable data={users} {columns} />
</div>