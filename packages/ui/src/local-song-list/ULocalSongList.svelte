<script lang="ts">
	import { cn } from "../utils.ts";
	import { Music } from "lucide-svelte";

	export interface LocalSongItem {
		filename: string;
		title: string;
		artist: string | null;
		albumArt: string | null;
		duration: number | null;
		lrcFilename: string | null;
	}

	interface Props {
		items: LocalSongItem[];
		loading?: boolean;
		onSelect?: (song: LocalSongItem) => void;
		className?: string;
	}

	const { items, loading = false, onSelect, className }: Props = $props();

	function formatDuration(seconds: number | null): string {
		if (seconds == null) return "--:--";
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, "0")}`;
	}

	function handleClick(e: Event, song: LocalSongItem) {
		e.preventDefault();

		onSelect?.(song)
	}
</script>

<div class={cn("flex flex-col gap-1", className)}>
	{#if loading}
		{#each { length: 3 } as _, i (i)}
			<div class="flex items-center gap-3 p-3 rounded-lg">
				<div class="skeleton w-12 h-12 rounded-md shrink-0"></div>
				<div class="flex flex-col gap-2 flex-1">
					<div class="skeleton h-4 w-2/3"></div>
					<div class="skeleton h-3 w-1/3"></div>
				</div>
				<div class="skeleton h-4 w-10 shrink-0"></div>
			</div>
		{/each}
	{:else if items.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-base-content/50 gap-2">
			<Music class="w-12 h-12 opacity-40" aria-hidden="true" />
			<span class="text-sm">No songs found</span>
		</div>
	{:else}
		{#each items as song (song.filename)}
			<a
				href="#"
				class="flex items-center gap-3 p-3 hover:bg-base-200 transition-colors text-left w-full"
				onclick={(e) => handleClick(e, song)}
			>
				{#if song.albumArt}
					<img
						src={song.albumArt}
						alt={song.title}
						class="size-24 rounded-full object-cover shrink-0"
					/>
				{:else}
					<div class="size-24 rounded-md bg-base-300 flex items-center justify-center shrink-0">
						<Music class="w-6 h-6 text-base-content/40" aria-hidden="true" />
					</div>
				{/if}

				<div class="flex flex-col flex-1 min-w-0">
					<span class="text-2xl font-medium truncate">{song.title}</span>
					{#if song.artist}
						<span class="text-xs text-base-content/60 truncate">{song.artist}</span>
					{/if}
				</div>

				<span class="text-xl text-base-content/50 shrink-0 tabular-nums">
					{formatDuration(song.duration)}
				</span>
			</a>
		{/each}
	{/if}
</div>