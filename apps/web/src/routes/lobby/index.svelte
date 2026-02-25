<!-- routify:meta _auth=true -->
<script lang="ts">
	import AppGameLayout from '@/components/layout/AppGameLayout.svelte'
	import { getSessionStore } from '@/lib/stores/session'
	import { client } from '@/lib/api'
	import { onMount } from 'svelte'

	const sessionStore = getSessionStore()
	onMount(async () => {
	})
</script>

<AppGameLayout>
	{#if sessionStore.isLoading}
		<div>Loading...</div>
	{:else if sessionStore.data}
		<div>User: {sessionStore.data.user.name}</div>
		<div>Email: {sessionStore.data.user.email}</div>
		<div>Session ID: {sessionStore.data.session.id}</div>
	{:else}
		<div>No session</div>
	{/if}
</AppGameLayout>
