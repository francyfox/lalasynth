<script lang="ts">
	import type { Lyric, Song } from "@app/api/src/modules/song/song.schema.ts";
	import { parseSyncedLyrics } from '../lyric-sync/lyric-sync.service.ts'
	import UInput from "../input/UInput.svelte";
	import UListPreview from "../list-preview/UListPreview.svelte";
	import ULyricSync from '../lyric-sync/ULyricSync.svelte'
	import UModal from "../modal/UModal.svelte";
	import { Debounced } from "runed";
	import { fade } from 'svelte/transition'

	interface Props {
		song?: Song | null;
		lyrics?: Lyric[];
		onSongUrl?: (url: string) => void;
		onLyricSelect?: (lyric: Lyric) => void;
		preloadStatus?: "idle" | "loading" | "ready" | "error";
		audioEl: HTMLAudioElement; // always provided by the store
	}

	const {
		onSongUrl,
		onLyricSelect,
		preloadStatus = "idle",
		song,
		lyrics,
		audioEl
	}: Props = $props();

	let url = $state("");
	let showLyrics = $state(false);
	let selectedLyric: Lyric | null = $state(null);

	const lines = $derived.by(() => parseSyncedLyrics(selectedLyric?.syncedLyrics || '', selectedLyric?.duration || 0))
	let offset = $state(0)

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

<div class="flex flex-col items-center gap-3">
	<a href="https://music.youtube.com" target="_blank" class="btn btn-secondary text-2xl">
		Go to YouTube.Music
	</a>

	<UInput
		bind:value={url}
		placeholder="Paste your YoutubeMusic track"
		label="Search"
	/>

	{#if preloadStatus === "loading"}
		<button transition:fade type="button" class="loading loading-spinner loading-sm"></button>
	{:else if preloadStatus === "ready"}
		<button
			type="button"
			class="btn btn-accent text-2xl"
			transition:fade
			onclick={showLyrics = true}
			>
			Lyrics settings
		</button>
	{:else if preloadStatus === "error"}
		<span transition:fade class="text-red-500 text-sm">Failed to load</span>
	{/if}
</div>

<UModal
		bind:open={showLyrics}
		cancelText="Cancel"
		confirmText="Confirm"
		onConfirm={handleConfirm}
>
	<div class="pt-8 flex flex-col gap-5">
		<ULyricSync
				{audioEl}
				duration={song?.duration ?? 0}
				lyrics={lines}
				onOffsetChange={(v) => offset = v}
		/>

		<UListPreview
				duration={song?.duration ?? 0}
				data={lyrics ?? []}
				onSelect={handleSelect}
		/>
	</div>
</UModal>