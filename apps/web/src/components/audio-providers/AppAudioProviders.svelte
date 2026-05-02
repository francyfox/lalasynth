<script lang="ts">
	import { cn } from "@/utils/cn";
	import UModal from "@package/ui/modal/UModal.svelte";
	import { HardDrive } from 'lucide-svelte'
	import IconYoutube from '~icons/local/youtube'

	interface Props {
		className?: string;
		onSongSelected?: () => void;
	}

	const { className, onSongSelected }: Props = $props();

	let localOpen = $state(false);
	let lazyAppLocalSongList = import("./AppLocalSongList.svelte")

	function handleSongSelected() {
		localOpen = false;
		onSongSelected?.();
	}
</script>

<div class={cn(className, "audio-providers flex flex-wrap gap-3")}>
	<button type="button" class="btn btn-accent text-2xl" onclick={() => (localOpen = true)}>
		<HardDrive class="size-6" />
		Local collection
	</button>

	<a href="https://music.youtube.com" target="_blank" class="btn btn-secondary text-2xl">
		<IconYoutube class="size-6" />
		Go to YouTube.Music
	</a>
</div>

<UModal bind:open={localOpen} title="Local Collection" className="min-h-full">
	{#if localOpen}
		{#await lazyAppLocalSongList then { default: LazyComponent}}
			<LazyComponent onSongSelected={handleSongSelected} />
		{/await}
	{/if}
</UModal>