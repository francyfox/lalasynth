<script lang="ts">
	import { cn } from "@/utils/cn";
	import UModal from "@package/ui/modal/UModal.svelte";

	interface Props {
		className?: string;
	}

	const { className }: Props = $props();

	let localOpen = $state(false);
	let lazyAppLocalSongList = import("./AppLocalSongList.svelte")
</script>

<div class={cn(className, "audio-providers flex flex-wrap gap-3")}>
	<a href="https://music.youtube.com" target="_blank" class="btn btn-secondary text-2xl">
		Go to YouTube.Music
	</a>

	<button type="button" class="btn btn-accent text-2xl" onclick={() => (localOpen = true)}>
		Local collection
	</button>
</div>

<UModal bind:open={localOpen} title="Local Collection">
	{#if localOpen}
		{#await lazyAppLocalSongList then { default: LazyComponent}}
			<LazyComponent />
		{/await}
	{/if}
</UModal>