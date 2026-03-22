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

	// Audio chain — built immediately so Tone.js owns audioEl before anything else
	const ctx = Tone.getContext().rawContext as AudioContext;
	const source = ctx.createMediaElementSource(audioEl);

	const analyserNodeInternal = ctx.createAnalyser();
	analyserNodeInternal.fftSize = 512;
	analyserNodeInternal.smoothingTimeConstant = 0.6;

	const gainNode = ctx.createGain();
	gainNode.gain.value = 0;

	source.connect(analyserNodeInternal);
	analyserNodeInternal.connect(gainNode);
	gainNode.connect(ctx.destination);

	function teardown() {
		audioEl.pause();
		audioEl.src = "";
		audioEl.load();
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.value = 0;
	}

	async function load(
		id: string,
		providers?: { audioProvider?: string; lyricProvider?: string },
	) {
		teardown();

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
		gainNode.gain.value = settingsStore.volume / 100;
	}

	async function play() {
		await Tone.start();
		if (ctx.state === "suspended") await ctx.resume();
		await audioEl.play();
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(settingsStore.volume / 100, ctx.currentTime + FADE_SEC);
	}

	/** Graceful fade-out pause — for in-game pause button. */
	function pause() {

		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_SEC);
		setTimeout(() => audioEl.pause(), FADE_SEC * 1000);
	}

	/** Immediate stop — use when navigating away or switching audio channel. */
	function stop() {

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

	// Sync gain with volume setting — always, so ULyricSync preview also respects mute/volume
	$effect.root(() => {
		$effect(() => {
			const v = settingsStore.volume / 100;
			gainNode.gain.cancelScheduledValues(ctx.currentTime);
			gainNode.gain.linearRampToValueAtTime(v, ctx.currentTime + FADE_SEC);
		});
	});

	return {
		audioEl,
		get song() { return song; },
		get lyrics() { return lyrics; },
		get status() { return status; },
		get analyserNode() { return analyserNodeInternal; },
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