import { createBgAudioStore } from "@/lib/stores/bg-audio.svelte";
import { createSongStore } from "@/lib/stores/songs.svelte";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const SFX_POOL_SIZE = 4;

function createAudioManager() {
	const bg = createBgAudioStore();
	const song = createSongStore();

	// Round-robin pool for overlapping short sound effects
	const sfxPool: HTMLAudioElement[] = Array.from(
		{ length: SFX_POOL_SIZE },
		() => new Audio(),
	);
	let sfxIdx = 0;

	/** Play background music, stopping any game song first. */
	async function playBg(name: string) {
		song.stop();
		await bg.play(name);
	}

	/** Resume bg audio after browser autoplay block. */
	async function resumeBg() {
		await bg.resume();
	}

	/** Load a song (stops bg music). Call startSong() to begin playback. */
	async function loadSong(
		id: string,
		providers?: { audioProvider?: string; lyricProvider?: string },
	) {
		bg.stop();
		await song.load(id, providers);
	}

	/** Start playback of the already-loaded song. */
	async function startSong() {
		await song.play();
	}

	/** Graceful fade-out pause — for in-game pause button. */
	function pauseSong() {
		song.pause();
	}

	/** Immediate stop of song — use when navigating away. */
	function stopSong() {
		song.stop();
	}

	/**
	 * Play a short sound effect without interrupting bg or song.
	 * Sounds must be at /static/sounds/{name}.webm on the API.
	 */
	function playSfx(name: string) {
		const el = sfxPool[sfxIdx % SFX_POOL_SIZE];
		sfxIdx++;
		el.src = `${API_BASE}/static/sounds/${name}.webm`;
		el.currentTime = 0;
		el.play().catch(() => {});
	}

	/** Stop all audio channels immediately. */
	function stopAll() {
		bg.stop();
		song.stop();
	}

	return {
		// — Song state (reactive) —
		get audioEl() { return song.audioEl; },
		get analyserNode() { return song.analyserNode; },
		get songData() { return song.song; },
		get lyrics() { return song.lyrics; },
		get songStatus() { return song.status; },

		// — Bg state (reactive) —
		get bgPlaying() { return bg.playing; },

		// — Actions —
		playBg,
		resumeBg,
		loadSong,
		startSong,
		pauseSong,
		stopSong,
		playSfx,
		stopAll,
	};
}

export const audioManager = createAudioManager();