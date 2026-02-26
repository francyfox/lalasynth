<!-- routify:meta _auth=true -->
<script lang="ts">
	import AppGameLayout from '@/components/layout/AppGameLayout.svelte'
	import { getSessionStore } from '@/lib/stores/session'

	const sessionStore = getSessionStore()
</script>

<AppGameLayout>
	{#if sessionStore.isLoading}
		<div>Loading...</div>
	{:else if sessionStore.data}
		<div>User: {sessionStore.data.user.name}</div>
		<div>Level: {sessionStore.data.user?.level}</div>
	{:else}
		<div>No session</div>
	{/if}
</AppGameLayout>
