<!-- routify:meta _auth=true -->
<script lang="ts">
import AppLobbyLayout from '@/components/layout/AppLobbyLayout.svelte'
import type { UIType } from '@/components/layout/game.layout.types'
import AppTraffic from '@/components/traffic/AppTraffic.svelte'
import { UUserLeadership } from '@package/ui/index.js'
import UTextScroller from '@package/ui/text-scroller/UTextScroller.svelte'
import { TextScrollerMock } from '@package/ui/text-scroller/text-scroller.mock'
import { UserLeadershipMock } from '@package/ui/user-leadership/user-leadership.mock'
import { fade } from 'svelte/transition'

let currentMode: UIType = $state("game")
let isPlaying: boolean = $state(false)
const song = TextScrollerMock
const users = UserLeadershipMock;

function handleStartGame() {
  setTimeout(() => {
    isPlaying = true
  }, 1000)
}
</script>

<AppLobbyLayout {currentMode} >
    <div class="relative my-auto flex flex-col gap-5">
        {#if !isPlaying}
            <AppTraffic
                    onGo={handleStartGame}
                    className="z-20 top-[-140px] left-[calc(50%-70px)] size-[140px]"
            />
        {/if}
        <UTextScroller
                {song}
                {isPlaying}
        />
    </div>

    <div class="flex gap-5 justify-between">
        <UUserLeadership
                {users}
                currentUserShortId={1}
                className=""
        />

        <UUserLeadership
                {users}
                currentUserShortId={1}
                className=""
        />
    </div>
</AppLobbyLayout>