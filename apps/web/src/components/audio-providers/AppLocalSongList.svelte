<script lang="ts">
	import { Debounced } from "runed";
	import ULocalSongList from "@package/ui/local-song-list/ULocalSongList.svelte";
	import UPagination from "@package/ui/pagination/UPagination.svelte";
	import UInput from "@package/ui/input/UInput.svelte";

	import {
		createLocalSongStore,
		LOCAL_SONG_PAGE_SIZE,
		type LocalSongItem,
	} from "@/lib/stores/local-songs.store.svelte";

	interface Props {
		onSelect?: (song: LocalSongItem) => void;
		className?: string;
	}

	const { onSelect, className }: Props = $props();

	let searchInput = $state("");
	let page = $state(1);

	const debouncedSearch = new Debounced(() => searchInput, 400);

	const store = createLocalSongStore(() => ({ search: debouncedSearch.current, page }));

	function handleSearchInput(e: Event) {
		searchInput = (e.target as HTMLInputElement).value;
		page = 1;
	}
</script>

<div class="flex flex-col gap-4 {className ?? ''}">
	<UInput
		value={searchInput}
		oninput={handleSearchInput}
		placeholder="Song name..."
		label="Search"
		required={false}
	/>

	<ULocalSongList
		items={store.items}
		loading={store.isLoading}
		{onSelect}
	/>

	{#if store.total > LOCAL_SONG_PAGE_SIZE}
		<UPagination
			bind:page
			pageSize={LOCAL_SONG_PAGE_SIZE}
			total={store.total}
		/>
	{/if}
</div>