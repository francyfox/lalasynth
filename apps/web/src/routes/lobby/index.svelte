<!-- routify:meta _auth=true -->
<script lang="ts">
	import AppLobbyLayout from '@/components/layout/AppLobbyLayout.svelte'
	import type { UIType } from '@/components/layout/game.layout.types'
	import AppLobby from '@/components/lobby/AppLobby.svelte'
	import { bgAudioStore } from '@/lib/stores/bg-audio.svelte'
	import { onMount } from 'svelte'

	let currentMode: UIType = $state('dialogue')

	onMount(() => {
		bgAudioStore.play('lobby')
	})
</script>

<AppLobbyLayout {currentMode} >
	<AppLobby />
</AppLobbyLayout>
