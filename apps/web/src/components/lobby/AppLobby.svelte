<script lang="ts">
	import AppAudioProviders from '@/components/audio-providers/AppAudioProviders.svelte'
	import AppLobbyState from '@/components/lobby-state/AppLobbyState.svelte'
	import UCounter from "@package/ui/counter/UCounter.svelte";
	import { USearchSong } from "@package/ui/index";
	import UTable from "@package/ui/table/UTable.svelte";
	import type { ColumnDef } from "@tanstack/table-core";
	import type { User } from "better-auth";
	import { audioManager } from "@/lib/stores/audio-manager.svelte";
	import { client } from "@/lib/api";
	import { toast } from "svelte-sonner";

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

	const canSave = $derived(
		audioManager.songStatus === 'ready' &&
		audioManager.songData !== null &&
		audioManager.lyrics.length > 0 &&
		audioManager.lyrics[0].syncedLyrics !== null
	);

	async function handleSaveSong() {
		const song = audioManager.songData;
		const lyric = audioManager.lyrics[0];
		if (!song || !lyric?.syncedLyrics) return;

		const response = client.POST("/song/save", {
			body: {
				videoId: song.videoId,
				title: song.title ?? song.videoId,
				artist: song.author,
				syncedLyrics: lyric.syncedLyrics,
				offsetMs: 0,
			},
		});

		const { error } = await response

		if (error) toast.error("Error! Cant save the song on local disk")
		toast.success("Complete. Check the local collection")

		return response;
	}
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
		audioEl={audioManager.audioEl}
		song={audioManager.songData}
		lyrics={audioManager.lyrics}
		onSongUrl={audioManager.loadSong}
		onSaveSong={handleSaveSong}
		preloadStatus={audioManager.songStatus}
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