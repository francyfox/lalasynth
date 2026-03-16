<!-- routify:meta _auth=true -->
<script lang="ts">
	import AppLobbyLayout from '@/components/layout/AppLobbyLayout.svelte'
	import type { UIType } from '@/components/layout/game.layout.types'
	import AppLobby from '@/components/lobby/AppLobby.svelte'
	import { audioManager } from '@/lib/stores/audio-manager.svelte'
	import { onMount } from 'svelte'

	let currentMode: UIType = $state('dialogue')

	onMount(() => {
		audioManager.playBg('lobby')
	})
</script>

<AppLobbyLayout {currentMode} >
	<AppLobby />
</AppLobbyLayout>
