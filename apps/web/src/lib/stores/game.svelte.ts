import type { Song } from "@app/src/modules/song/song.types";
import type { LocalSongItem } from "@/lib/stores/local-songs.svelte";

export type GameMode = "single" | "multiplayer";

export type SelectedSong =
	| { type: "local"; song: LocalSongItem }
	| { type: "youtube"; song: Song };

function createGameStore() {
	let mode = $state<GameMode | null>(null);
	let selectedSong = $state<SelectedSong | null>(null);

	return {
		get mode() {
			return mode;
		},
		set mode(v: GameMode | null) {
			mode = v;
		},

		get selectedSong() {
			return selectedSong;
		},
		set selectedSong(v: SelectedSong | null) {
			selectedSong = v;
		},

		reset() {
			mode = null;
			selectedSong = null;
		},
	};
}

export const gameStore = createGameStore();
