<script lang="ts">
	import type { Lyric, Song } from "@app/api/src/modules/song/song.schema.ts";
	import UInput from "../input/UInput.svelte";
	import UListPreview from "../list-preview/UListPreview.svelte";
	import UModal from "../modal/UModal.svelte";
	import { Debounced } from "runed";

	interface Props {
		song: Song;
		lyrics?: Lyric[];
		onSongUrl?: (url: string) => void;
		onLyricSelect?: (lyric: Lyric) => void;
		preloadStatus?: "idle" | "loading" | "ready" | "error";
	}

	const { onSongUrl, onLyricSelect, preloadStatus = "idle", song, lyrics }: Props = $props();

	let url = $state("");
	let showLyrics = $state(false);
	let selectedLyric: Lyric | null = $state(null);

	const debouncedUrl = new Debounced(() => url, 600);

	const ytPattern = /(?:music\.youtube\.com\/watch|youtube\.com\/watch|youtu\.be)\S*/;

	$effect(() => {
		if (ytPattern.test(debouncedUrl.current)) {
			onSongUrl?.(debouncedUrl.current);
		}
	});

	$effect(() => {
		if (lyrics?.length) showLyrics = true;
	});

	function handleSelect(lyric: Lyric) {
		selectedLyric = lyric;
	}

	function handleConfirm() {
		showLyrics = false;
	}
</script>

<div class="flex flex-col items-center gap-2">
	<a href="https://music.youtube.com" target="_blank" class="btn btn-secondary text-2xl">
		Go to YouTube.Music
	</a>

	<UInput
		bind:value={url}
		placeholder="Paste your YoutubeMusic track"
		label="Search"
	/>

	{#if preloadStatus === "loading"}
		<span class="loading loading-spinner loading-sm"></span>
	{:else if preloadStatus === "ready"}
		<span class="text-green-500 text-sm">Ready!</span>
	{:else if preloadStatus === "error"}
		<span class="text-red-500 text-sm">Failed to load</span>
	{/if}
</div>

<UModal
		bind:open={showLyrics}
		cancelText="Cancel"
		confirmText="Confirm"
		{handleConfirm}
>
	<UListPreview
		duration={song?.duration ?? 0}
		data={lyrics ?? []}
		onSelect={handleSelect}
		className="mt-8"
	/>
</UModal>