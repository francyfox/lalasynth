<script lang="ts">
	import type { Song } from "@app/src/modules/song/song.schema";
	import UCounter from "@package/ui/counter/UCounter.svelte";
	import { USearchSong } from "@package/ui/index";
	import UTable from "@package/ui/table/UTable.svelte";
	import type { ColumnDef } from "@tanstack/table-core";
	import type { User } from "better-auth";
	import { createSongStore } from "@/lib/stores/songs.svelte";

	interface Props {
		countdown?: number;
		isWinner: boolean;
		lobbyState: "timer" | "selected" | "playing";
		selectedSong: Song;
		winner?: User;
		lobbyUsers: User[];
	}

	let {
		isWinner = false,
		winner,
		lobbyState = "selected",
		countdown = $bindable(90),
		selectedSong,
	}: Props = $props();

	const songStore = createSongStore();

	let users = $state<Partial<User>[]>([
		{ no: 1, name: "Test", bestWpm: 1.64, totalWins: 10 },
		{ no: 2, name: "Test2", bestWpm: 2.64, totalWins: 3 },
	]);

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "no",
			header: "#No",
		},
		{
			accessorKey: "name",
			header: "Name",
		},
		{
			accessorKey: "bestWpm",
			header: "Best WPM",
		},
		{
			accessorKey: "totalWins",
			header: "Total Wins",
		},
	];
</script>

<div class="mx-auto mt-5 w-full max-w-2xl flex flex-col gap-5 p-5 bg-base-300/90 rounded-lg">
	{#if /selected|playing/.test(lobbyState)}
		<div class="flex justify-center">
			<UCounter {countdown} />
		</div>
	{/if}

	{#if lobbyState === "timer" && isWinner && !selectedSong}
		<!-- song selection UI placeholder -->
	{/if}

	<USearchSong
		song={songStore.song}
		lyrics={songStore.lyrics}
		onSongUrl={songStore.load}
		preloadStatus={songStore.status}
	/>

	<div class="flex gap-2 justify-center">
		<button type="button" class="btn btn-primary" onclick={songStore.play}>Play</button>
		<button type="button" class="btn btn-neutral" onclick={songStore.pause}>Pause</button>
		<button
			type="button"
			class="btn {songStore.is16bit ? 'btn-warning' : 'btn-ghost'}"
			onclick={songStore.toggle16bit}
		>16-bit</button>
	</div>

	{#if lobbyState === "timer" && !isWinner}
		<p class="hint text-2xl text-center text-gray-400">
			Only winner in last game can select a song <br />
			<span class="inline-flex gap-2 items-center">
				<span aria-label="status" class="status status-primary animate-bounce"></span>
				<span>User: <span class="text-warning">${winner?.name}</span> selecting a song...</span>
			</span>
		</p>
	{/if}

	{#if lobbyState === "selected"}
		<p class="hint text-4xl text-center text-primary font-bold">
			Get ready for the next battle
		</p>
	{/if}

	<h2 class="text-4xl text-center">
		<span>#0000</span> players in lobby
	</h2>
	<UTable data={users} {columns} />
</div>