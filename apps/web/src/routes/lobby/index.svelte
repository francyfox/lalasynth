<!-- routify:meta _auth=true -->
<script lang="ts">
	import { getSessionStore } from '@/lib/stores/session'

	const sessionStore = getSessionStore()
</script>

{#if sessionStore.isLoading}
	<div>Loading...</div>
{:else if sessionStore.data}
	<div>User: {sessionStore.data.user.name}</div>
	<div>Email: {sessionStore.data.user.email}</div>
	<div>Session ID: {sessionStore.data.session.id}</div>
{:else}
	<div>No session</div>
{/if}