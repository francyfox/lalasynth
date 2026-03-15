<script lang="ts">
	import { gameStore } from '@/lib/stores/game.svelte'
	import { Debounced } from "runed";
	import { goto } from '@roxi/routify'
	import ULocalSongList from "@package/ui/local-song-list/ULocalSongList.svelte";
	import UPagination from "@package/ui/pagination/UPagination.svelte";
	import UInput from "@package/ui/input/UInput.svelte";

	import {
		createLocalSongStore,
		LOCAL_SONG_PAGE_SIZE,
		type LocalSongItem,
	} from "@/lib/stores/local-songs.svelte.js";

	interface Props {
		className?: string;
	}

	const _init = $goto;

	const { className }: Props = $props();

	let searchInput = $state("");
	let page = $state(1);

	const debouncedSearch = new Debounced(() => searchInput, 400);

	const store = createLocalSongStore(() => ({ search: debouncedSearch.current, page }));

	function onSelect(song: LocalSongItem) {
		gameStore.selectedSong = {
			type: 'local',
			song
		}
		$goto('/game')
	}
</script>

<div class="flex flex-col gap-4 {className ?? ''}">
	<UInput
		bind:value={searchInput}
		placeholder="Song name..."
		label="Search"
		required={false}
	/>

	<ULocalSongList
		items={store.getItems()}
		loading={store.isLoading()}
		{onSelect}
	/>

	<UPagination
			bind:page
			pageSize={LOCAL_SONG_PAGE_SIZE}
			total={store.getTotal()}
	/>
</div>