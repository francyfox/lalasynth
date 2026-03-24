import type { AudioProviders, IAudioManager } from "./audio.types";
import { createBgPlayer } from "./bg-player.svelte";
import { createSongPlayer } from "./song-player.svelte";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const SFX_POOL_SIZE = 4;

function createAudioManager(): IAudioManager {
	const bg = createBgPlayer();
	const song = createSongPlayer();

	const sfxPool: HTMLAudioElement[] = Array.from(
		{ length: SFX_POOL_SIZE },
		() => new Audio(),
	);
	let sfxIdx = 0;

	async function playBg(name: string) {
		song.stop();
		await bg.play(name);
	}

	async function resumeBg() {
		await bg.resume();
	}

	async function loadSong(id: string, providers?: AudioProviders) {
		bg.stop();
		await song.load(id, providers);
	}

	async function startSong() {
		await song.play();
	}

	function pauseSong() {
		song.pause();
	}

	async function resumeSong() {
		await song.resume();
	}

	function stopSong() {
		song.stop();
	}

	function playSfx(name: string) {
		const el = sfxPool[sfxIdx % SFX_POOL_SIZE];
		sfxIdx++;
		el.src = `${API_BASE}/static/sounds/${name}.webm`;
		el.currentTime = 0;
		el.play().catch(() => {});
	}

	function stopAll() {
		bg.stop();
		song.stop();
	}

	return {
		get audioEl() { return song.audioEl; },
		get songCurrentTime() { return song.currentTime; },
		get songDuration() { return song.duration; },
		get analyserNode() { return song.analyserNode; },
		get songData() { return song.song; },
		get lyrics() { return song.lyrics; },
		get songStatus() { return song.status; },
		get bgPlaying() { return bg.playing; },
		playBg,
		resumeBg,
		loadSong,
		startSong,
		pauseSong,
		resumeSong,
		stopSong,
		playSfx,
		stopAll,
	};
}

export const audioManager = createAudioManager();