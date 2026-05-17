<!-- routify:meta _auth=true -->
<script lang="ts">
	import { goto } from "@roxi/routify";
	import { onDestroy, onMount } from "svelte";
	import { activeServer } from "@/lib/stores/active-server.svelte";
	import { serversStore, type GameServer } from "@/lib/stores/servers.svelte";

	const _init = $goto;

	onMount(() => {
		if (activeServer.current) {
			$goto("/lobby");
			return;
		}
		serversStore.connect();
	});

	onDestroy(() => {
		serversStore.disconnect();
	});

	function connect(server: GameServer) {
		activeServer.set({ id: server.id, name: server.name, url: server.url });
		$goto("/lobby");
	}

	const statusLabel: Record<GameServer["status"], string> = {
		idle: "Waiting",
		playing: "In Game",
		offline: "Offline",
	};

	const statusClass: Record<GameServer["status"], string> = {
		idle: "badge-success",
		playing: "badge-warning",
		offline: "badge-error",
	};
</script>

<div class="min-h-screen bg-base-200 flex flex-col items-center justify-center p-6 gap-6">
	<div class="w-full max-w-2xl">
		<h1 class="text-3xl font-bold font-mono mb-1">Server List</h1>
		<p class="text-base-content/50 text-sm mb-6">Select a server to join</p>

		{#if serversStore.list.length === 0}
			<div class="flex flex-col items-center gap-3 py-16 text-base-content/40">
				<span class="text-5xl">📡</span>
				<p class="font-mono">No servers online</p>
				<p class="text-xs">Start apps/api on your machine to host a game</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each serversStore.list as server (server.id)}
					<div class="card bg-base-100 shadow-sm border border-base-300">
						<div class="card-body flex-row items-center gap-4 p-4">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<span class="font-mono font-bold truncate">{server.name}</span>
									<span class="badge badge-xs {statusClass[server.status]}">
										{statusLabel[server.status]}
									</span>
								</div>
								<div class="flex items-center gap-3 text-xs text-base-content/50 font-mono">
									<span>👥 {server.playerCount}/{server.maxPlayers}</span>
									<span class="truncate text-[10px]">{server.url}</span>
								</div>
							</div>
							<button
								class="btn btn-primary btn-sm"
								disabled={server.status === "offline"}
								onclick={() => connect(server)}
							>
								Connect
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
