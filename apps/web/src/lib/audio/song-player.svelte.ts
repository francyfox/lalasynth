import type { Lyric, Song } from "@app/src/modules/song/song.types";
import { untrack } from "svelte";
import * as Tone from "tone";
import { client } from "@/lib/api";
import { settingsStore } from "@/lib/stores/settings.svelte";
import type { AudioProviders, ISongPlayer, PlayerState } from "./audio.types";
import { createWebAudioFader } from "./fader";

export function createSongPlayer(): ISongPlayer {
	const audioEl = new Audio();

	let song = $state<Song | null>(null);
	let lyrics = $state<Lyric[]>([]);
	let status = $state<PlayerState>("idle");
	let currentTime = $state(0);
	let duration = $state(0);
	let paused = $state(true);

	const ctx = Tone.getContext().rawContext as AudioContext;
	const source = ctx.createMediaElementSource(audioEl);

	const analyserNode = ctx.createAnalyser();
	analyserNode.fftSize = 512;
	analyserNode.smoothingTimeConstant = 0.6;

	const gainNode = ctx.createGain();
	gainNode.gain.value = 0;

	source.connect(analyserNode);
	analyserNode.connect(gainNode);
	gainNode.connect(ctx.destination);

	const radioNoise = new Tone.Noise("pink");
	const radioNoiseFilter = new Tone.Filter({ type: "bandpass", frequency: 3000, Q: 0.5 });
	const radioNoiseGain = new Tone.Gain(0);
	radioNoise.connect(radioNoiseFilter);
	radioNoiseFilter.connect(radioNoiseGain);
	radioNoiseGain.toDestination();
	radioNoise.start();

	const fader = createWebAudioFader(gainNode, ctx);

	const FADE_MS = 400;

	let loadAbort: AbortController | null = null;
	let pauseTimeout: ReturnType<typeof setTimeout> | null = null;

	function clearPauseTimeout() {
		if (pauseTimeout !== null) {
			clearTimeout(pauseTimeout);
			pauseTimeout = null;
		}
	}

	function teardown() {
		clearPauseTimeout();
		loadAbort?.abort();
		loadAbort = null;
		audioEl.pause();
		audioEl.src = "";
		audioEl.load();
		radioNoiseGain.gain.setValueAtTime(0, ctx.currentTime);
		fader.cancel();
		fader.setImmediate(0);
	}

	async function load(id: string, providers?: AudioProviders) {
		teardown();
		status = "loading";
		song = null;
		lyrics = [];

		loadAbort = new AbortController();
		const { signal } = loadAbort;

		const { data, error } = await client.GET("/song/{id}", {
			params: { path: { id }, query: providers },
		});

		if (signal.aborted) return;
		if (error || !data) {
			status = "error";
			return;
		}

		song = data.song;
		lyrics = data.lyrics;

		audioEl.addEventListener(
			"canplay",
			() => {
				status = "ready";
			},
			{ once: true, signal },
		);
		audioEl.addEventListener(
			"error",
			(e) => {
				console.error(e);
				status = "error";
			},
			{ once: true, signal },
		);

		audioEl.src = `/song/stream/${data.song.videoId}`;
		audioEl.load();
		fader.setImmediate(settingsStore.volume / 100);
	}

	async function play() {
		if (!audioEl.src) return;
		await Tone.start();
		if (ctx.state === "suspended") await ctx.resume();
		try {
			await audioEl.play();
		} catch (e) {
			if (e instanceof DOMException) {
				status = "error";
				return;
			}
			throw e;
		}
		fader.fadeTo(settingsStore.volume / 100);
	}

	function pause() {
		clearPauseTimeout();
		fader.fadeTo(0);
		pauseTimeout = setTimeout(() => {
			audioEl.pause();
			pauseTimeout = null;
		}, FADE_MS);
	}

	async function resume() {
		clearPauseTimeout();
		fader.fadeTo(settingsStore.volume / 100);
		if (audioEl.paused) await audioEl.play();
	}

	function stop() {
		teardown();
		song = null;
		lyrics = [];
		status = "idle";
	}

	function seekTo(seconds: number) {
		audioEl.currentTime = seconds;
	}

	function setNoiseLevel(level: number) {
		radioNoiseGain.gain.rampTo((Math.max(0, Math.min(5, level)) / 5) * 0.12, 0.2);
	}

	$effect.root(() => {
		function onTimeUpdate() {
			currentTime = audioEl.currentTime;
		}
		function onDurationChange() {
			duration = audioEl.duration ?? 0;
		}
		function onPlay() {
			paused = false;
		}
		function onPause() {
			paused = true;
		}

		audioEl.addEventListener("timeupdate", onTimeUpdate);
		audioEl.addEventListener("durationchange", onDurationChange);
		audioEl.addEventListener("play", onPlay);
		audioEl.addEventListener("pause", onPause);

		$effect(() => {
			const v = settingsStore.volume / 100;
			if (!untrack(() => paused)) {
				fader.fadeTo(v);
			} else {
				fader.setImmediate(v);
			}
		});

		function onVisibilityChange() {
			if (document.hidden) {
				fader.cancel();
				fader.setImmediate(0);
			} else if (!audioEl.paused && pauseTimeout === null) {
				fader.fadeTo(settingsStore.volume / 100);
			}
		}
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			audioEl.removeEventListener("timeupdate", onTimeUpdate);
			audioEl.removeEventListener("durationchange", onDurationChange);
			audioEl.removeEventListener("play", onPlay);
			audioEl.removeEventListener("pause", onPause);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	});

	return {
		audioEl,
		get song() {
			return song;
		},
		get lyrics() {
			return lyrics;
		},
		get status() {
			return status;
		},
		get analyserNode() {
			return analyserNode;
		},
		get currentTime() {
			return currentTime;
		},
		get duration() {
			return duration;
		},
		get paused() {
			return paused;
		},
		load,
		play,
		pause,
		resume,
		stop,
		seekTo,
		setNoiseLevel,
	};
}

export type SongPlayer = ReturnType<typeof createSongPlayer>;
