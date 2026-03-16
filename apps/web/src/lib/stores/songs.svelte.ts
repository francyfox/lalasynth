import type { Lyric, Song } from "@app/src/modules/song/song.types";
import * as Tone from "tone";
import { client } from "@/lib/api";
import { settingsStore } from "@/lib/stores/settings.svelte";

type PlayerState = "idle" | "loading" | "ready" | "error";

const FADE_SEC = 0.4;

export function createSongStore() {
	const audioEl: HTMLAudioElement = new Audio();

	let song = $state<Song | null>(null);
	let lyrics = $state<Lyric[]>([]);
	let status = $state<PlayerState>("idle");
	let isPlaying = $state(false);

	// Audio chain — built once on first play, reused across songs
	let gainNode: GainNode | null = null;
	let chainBuilt = false;

	function teardown() {
		audioEl.pause();
		audioEl.src = "";
		audioEl.load();

		if (gainNode) {
			const ctx = Tone.getContext().rawContext as AudioContext;
			gainNode.gain.cancelScheduledValues(ctx.currentTime);
			gainNode.gain.value = 0;
		}
	}

	function buildChain() {
		if (chainBuilt) return;
		chainBuilt = true;

		const ctx = Tone.getContext().rawContext as AudioContext;
		const source = ctx.createMediaElementSource(audioEl);

		gainNode = ctx.createGain();
		gainNode.gain.value = 0;

		source.connect(gainNode);
		gainNode.connect(ctx.destination);
	}

	async function load(
		id: string,
		providers?: { audioProvider?: string; lyricProvider?: string },
	) {
		teardown();
		isPlaying = false;
		status = "loading";
		song = null;
		lyrics = [];

		const { data, error } = await client.GET("/song/{id}", {
			params: { path: { id }, query: providers },
		});

		if (error || !data) {
			status = "error";
			return;
		}

		song = data.song;
		lyrics = data.lyrics;

		audioEl.addEventListener("canplay", () => { status = "ready"; }, { once: true });
		audioEl.addEventListener("error", (e) => {
			console.error(e);
			status = "error";
		}, { once: true });

		audioEl.src = `/song/stream/${data.song.videoId}`;
		audioEl.load();
	}

	async function play() {
		await Tone.start();
		buildChain();
		const ctx = Tone.getContext().rawContext as AudioContext;
		await audioEl.play();
		isPlaying = true;
		if (!gainNode) return;
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(settingsStore.volume / 100, ctx.currentTime + FADE_SEC);
	}

	/** Graceful fade-out pause — for in-game pause button. */
	function pause() {
		isPlaying = false;
		if (!gainNode) return;
		const ctx = Tone.getContext().rawContext as AudioContext;
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_SEC);
		setTimeout(() => audioEl.pause(), FADE_SEC * 1000);
	}

	/** Immediate stop — use when navigating away or switching audio channel. */
	function stop() {
		isPlaying = false;
		teardown();
		song = null;
		lyrics = [];
		status = "idle";
	}

	function seekTo(seconds: number) {
		audioEl.currentTime = seconds;
	}

	function currentTime() {
		return audioEl.currentTime;
	}

	function duration() {
		return audioEl.duration ?? 0;
	}

	// Sync gain with volume setting — only while playing
	$effect.root(() => {
		$effect(() => {
			const v = settingsStore.volume / 100;
			if (!gainNode || !isPlaying) return;
			const ctx = Tone.getContext().rawContext as AudioContext;
			gainNode.gain.cancelScheduledValues(ctx.currentTime);
			gainNode.gain.linearRampToValueAtTime(v, ctx.currentTime + FADE_SEC);
		});
	});

	return {
		audioEl,
		get song() { return song; },
		get lyrics() { return lyrics; },
		get status() { return status; },
		load,
		play,
		pause,
		stop,
		seekTo,
		currentTime,
		duration,
	};
}

export type SongStore = ReturnType<typeof createSongStore>;