<!-- routify:meta _auth=true -->
<script lang="ts">
import AppLobbyLayout from '@/components/layout/AppLobbyLayout.svelte'
import type { UIType } from '@/components/layout/game.layout.types'
import { UUserLeadership } from '@package/ui/index.js'
import UTextScroller from '@package/ui/text-scroller/UTextScroller.svelte'
import { TextScrollerMock } from '@package/ui/text-scroller/text-scroller.mock'
import { UserLeadershipMock } from '@package/ui/user-leadership/user-leadership.mock'

let currentMode: UIType = $state("game")
let isPlaying: boolean = $state(true)
const song = TextScrollerMock
const users = UserLeadershipMock;
</script>

<AppLobbyLayout {currentMode} >
    <div class="my-auto flex flex-col gap-5">
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