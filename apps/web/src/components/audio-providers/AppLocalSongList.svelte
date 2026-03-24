<script lang="ts">
	import { gameStore } from "@/lib/stores/game.svelte";
	import { audioManager } from "@/lib/audio/audio-manager.svelte";
	import { Debounced } from "runed";
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
		onSongSelected?: () => void;
	}

	const { className, onSongSelected }: Props = $props();

	let searchInput = $state("");
	let page = $state(1);

	const debouncedSearch = new Debounced(() => searchInput, 500);

	const store = createLocalSongStore(() => ({ search: debouncedSearch.current, page }));

	function onSelect(song: LocalSongItem) {
		gameStore.selectedSong = { type: "local", song };
		audioManager.loadSong(song.filename, { audioProvider: "local-audio", lyricProvider: "local-lyric" });
		onSongSelected?.();
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