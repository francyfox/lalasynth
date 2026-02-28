<!-- routify:meta _auth=true -->
<script lang="ts">
import AppLobbyLayout from '@/components/layout/AppLobbyLayout.svelte'
import type { UIType } from '@/components/layout/game.layout.types'
import UTextScroller from '@package/ui/text-scroller/UTextScroller.svelte'
import { TextScrollerMock } from '@package/ui/text-scroller/text-scroller.mock'

let currentMode: UIType = $state("game")
const song = TextScrollerMock
</script>

<AppLobbyLayout {currentMode} >
    <UTextScroller {song} />
</AppLobbyLayout>