<script lang="ts">
	import type { Lyric } from "@app/api/src/modules/song/song.schema.ts";
	import { cn } from '../utils.ts'

	interface Props {
		duration: number;
		data: Lyric[];
		onSelect?: (lyric: Lyric) => void;
		className?: string;
	}

	const { data, duration, onSelect, className }: Props = $props();

	let selected = $state<Lyric | null>(null);

	function getSyncPercent(lyric: Lyric): number {
		return Math.max(
			0,
			Math.min(100, Math.round((1 - Math.abs(lyric.duration - duration) / duration) * 100)),
		);
	}

	function getBadgeClass(percent: number): string {
		if (percent >= 90) return "badge-success";
		if (percent >= 70) return "badge-warning";
		return "badge-error";
	}

	function selectLyric(lyric: Lyric): void {
		selected = lyric;
		onSelect?.(lyric);
	}

	const previewLines = $derived.by(() => {
		if (!selected) return [];
		const text = selected.plainLyrics ?? selected.syncedLyrics ?? "";
		return text
			.split("\n")
			.filter((line) => line.trim().length > 0)
			.slice(0, 30);
	});
</script>

<div class={cn(className, "card bg-base-200 shadow-xl w-full")}>
	<div class="card-body p-4 gap-4">
		<div class="flex gap-4 min-h-0">
			<div class="flex flex-col gap-2 w-1/2 overflow-y-auto max-h-96 pr-1">
				{#if data.length === 0}
					<p class="text-base-content/50 text-sm text-center mt-4">No results found</p>
				{/if}
				{#each data as lyric (lyric.id)}
					{@const syncPct = getSyncPercent(lyric)}
					{@const badgeClass = getBadgeClass(syncPct)}
					<button
						class="btn btn-ghost btn-sm h-auto min-h-0 flex flex-col items-start text-left p-3 rounded-lg border border-base-300 hover:bg-base-300 {selected?.id === lyric.id ? 'bg-base-300 border-primary' : ''}"
						onclick={() => selectLyric(lyric)}
					>
						<span class="font-semibold text-xl truncate w-full">{lyric.trackName}</span>
						<span class="text-xl text-base-content/70 truncate w-full">{lyric.artistName}</span>
						<span class="flex items-center gap-2 mt-1 w-full">
							<span class="text-xl text-base-content/50">{Math.floor(lyric.duration / 60)}:{String(Math.floor(lyric.duration % 60)).padStart(2, "0")}</span>
							{#if lyric.instrumental}
								<span class="badge badge-xl badge-neutral">Instrumental</span>
							{/if}
							<span class="badge badge-xl {badgeClass} ml-auto">{syncPct}% sync</span>
						</span>
					</button>
				{/each}
			</div>

			<div class="flex flex-col w-1/2 overflow-y-auto max-h-96 bg-base-100 rounded-lg p-3">
				{#if selected}
					<p class="text-xs font-semibold text-base-content/60 mb-2 uppercase tracking-wide">
						{selected.trackName} — {selected.artistName}
					</p>
					{#if selected.instrumental}
						<p class="text-base-200/80 italic text-xl">This track is instrumental.</p>
					{:else if previewLines.length > 0}
						<div class="flex flex-col gap-0.5">
							{#each previewLines as line, i (i)}
								<p class="text-sm leading-relaxed">{line}</p>
							{/each}
						</div>
					{:else}
						<p class="text-base-content/50 italic text-sm">No lyrics available.</p>
					{/if}
				{:else}
					<p class="text-base-content/40 text-sm text-center mt-8">Select a result to preview lyrics</p>
				{/if}
			</div>
		</div>
	</div>
</div>