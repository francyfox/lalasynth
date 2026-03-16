<script lang="ts">
	import AppAudioProviders from '@/components/audio-providers/AppAudioProviders.svelte'
	import AppLobbyState from '@/components/lobby-state/AppLobbyState.svelte'
	import UCounter from "@package/ui/counter/UCounter.svelte";
	import { USearchSong } from "@package/ui/index";
	import UTable from "@package/ui/table/UTable.svelte";
	import type { ColumnDef } from "@tanstack/table-core";
	import type { User } from "better-auth";
	import { songStore } from "@/lib/stores/songs.svelte";

	interface Props {
		countdown?: number;
		isWinner: boolean;
		lobbyState: "timer" | "selected" | "playing";
		winner?: User;
		lobbyUsers: User[];
	}

	let {
		isWinner = false,
		winner,
		lobbyState = "timer",
		countdown = $bindable(90),
	}: Props = $props();

	const gameMode = $state<'single' | 'multiplayer'>('single');

	type LobbyUser = { no: number; name: string; bestWpm: number; totalWins: number };

	let users = $state<LobbyUser[]>([
		{ no: 1, name: "Test", bestWpm: 1.64, totalWins: 10 },
		{ no: 2, name: "Test2", bestWpm: 2.64, totalWins: 3 },
	]);

	const columns: ColumnDef<LobbyUser>[] = [
		{ accessorKey: "no", header: "#No" },
		{ accessorKey: "name", header: "Name" },
		{ accessorKey: "bestWpm", header: "Best WPM" },
		{ accessorKey: "totalWins", header: "Total Wins" },
	];
</script>

<div class="mx-auto mt-5 card w-full max-w-2xl flex flex-col gap-5 p-5 bg-base-300/90">
	{#if /selected|playing/.test(lobbyState) && gameMode === 'multiplayer'}
		<div class="flex justify-center">
			<UCounter {countdown} />
		</div>
	{/if}

	<AppLobbyState />

	<AppAudioProviders />

	<USearchSong
		audioEl={songStore.audioEl}
		song={songStore.song}
		lyrics={songStore.lyrics}
		onSongUrl={songStore.load}
		preloadStatus={songStore.status}
	/>

	{#if lobbyState === "selected"}
		<p class="text-4xl text-center text-primary font-bold">
			Get ready for the next battle
		</p>
	{/if}

	{#if gameMode === "multiplayer"}
		<h2 class="text-4xl text-center">
			<span>#0000</span> players in lobby
		</h2>
		<UTable data={users} {columns} />
	{/if}
</div>