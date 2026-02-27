<!-- routify:meta _auth=true -->
<script lang="ts">
	import AppLobbyLayout from '@/components/layout/AppLobbyLayout.svelte'
	import type { UIType } from '@/components/layout/game.layout.types'
	import AppLobby from '@/components/lobby/AppLobby.svelte'

	let currentMode: UIType = $state('lobby')
</script>

<AppLobbyLayout {currentMode} >
	<AppLobby />
</AppLobbyLayout>
