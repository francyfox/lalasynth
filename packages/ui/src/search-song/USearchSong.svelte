<script lang="ts">
	import UInput from "../input/UInput.svelte";
	import { Debounced } from "runed";

	interface Props {
		onSongUrl?: (url: string) => void;
		preloadStatus?: "idle" | "loading" | "ready" | "error";
	}

	const { onSongUrl, preloadStatus = "idle" }: Props = $props();

	let url = $state("");

	const debouncedUrl = new Debounced(() => url, 600);

	const ytPattern =
		/(?:music\.youtube\.com\/watch|youtube\.com\/watch|youtu\.be)\S*/;

	$effect(() => {
		if (ytPattern.test(debouncedUrl.current)) {
			onSongUrl?.(debouncedUrl.current);
		}
	});
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