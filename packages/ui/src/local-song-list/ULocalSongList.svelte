<script lang="ts">
	import { cn } from "../utils.ts";

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
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="w-12 h-12 opacity-40"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
				/>
			</svg>
			<span class="text-sm">No songs found</span>
		</div>
	{:else}
		{#each items as song (song.filename)}
			<button
				type="button"
				class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors text-left w-full"
				onclick={() => onSelect?.(song)}
			>
				{#if song.albumArt}
					<img
						src={song.albumArt}
						alt={song.title}
						class="size-24 rounded-full object-cover shrink-0"
					/>
				{:else}
					<div class="size-24 rounded-md bg-base-300 flex items-center justify-center shrink-0">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6 text-base-content/40"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
							/>
						</svg>
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
			</button>
		{/each}
	{/if}
</div>