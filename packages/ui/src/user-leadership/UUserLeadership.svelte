<script lang="ts">
import { cn } from '../utils.ts'
import { flip } from 'svelte/animate';
interface Props {
    className?: string
    currentUserShortId: number
    users: {
      name: string
      wpm: number
      progress: number
    }[]
}

const { className, users, currentUserShortId }: Props = $props()
</script>

<div class={cn(className, "card p-5 max-w-lg flex flex-col")}>
    <div class="flex flex-col gap-2">
        {#each users as user, index (user.shortId)}
            <div animate:flip={{ duration: 400 }} class="h-[60px] px-2 py-1 flex gap-2 items-center rounded-md {currentUserShortId === user.shortId ? 'bg-gray-700/90' : 'bg-base-200/90'}">
                <span class="text-xl w-[150px] overflow-hidden whitespace-nowrap text-ellipsis">#{index} ${user.name}</span>
                <div class="relative flex flex-col">
                    <span class="absolute w-full top-[-25px] text-gray-300 text-center">{user.wpm} words/min</span>
                    <progress
                            class="progress w-56 {currentUserShortId === user.shortId ? 'progress-accent' : 'progress-secondary'}"
                            value={user.progress}
                            max="100"
                    >
                    </progress>
                </div>


                <span class="text-2xl">{ user.progress }%</span>
            </div>
        {/each}
    </div>
</div>