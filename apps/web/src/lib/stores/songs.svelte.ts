import type { Lyric, Song } from "@app/src/modules/song/song.schema";
import * as Tone from "tone";
import { client } from "@/lib/api";

type PlayerState = "idle" | "loading" | "ready" | "error";

const FADE_SEC = 0.4;

function makeCrusherCurve(bits: number): Float32Array<ArrayBuffer> {
	const n = 512;
	const curve = new Float32Array(new ArrayBuffer(n * 4));
	const step = 0.5 ** (bits - 1);
	for (let i = 0; i < n; i++) {
		const x = (i * 2) / n - 1;
		curve[i] = Math.round(x / step) * step;
	}
	return curve;
}

export function createSongStore() {
	// Single element, created once — never null, never proxied by Svelte
	const audioEl: HTMLAudioElement = new Audio();

	let song = $state<Song | null>(null);
	let lyrics = $state<Lyric[]>([]);
	let status = $state<PlayerState>("idle");
	let is16bit = $state(false);

	// Audio chain — built once on first play, reused across songs
	let gainNode: GainNode | null = null;
	let crusherNode: WaveShaperNode | null = null;
	let chainBuilt = false;

	/**
	 * Stop playback and clear the src without touching the audio chain.
	 * MediaElementSource stays connected — src change is enough for a new song.
	 */
	function teardown() {
		audioEl.pause();
		audioEl.src = "";
		audioEl.load();

		// Immediately silence gain so there's no bleed into the next load
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
		// createMediaElementSource is called exactly once for this element
		const source = ctx.createMediaElementSource(audioEl);

		crusherNode = ctx.createWaveShaper();
		crusherNode.curve = makeCrusherCurve(is16bit ? 4 : 16) as Float32Array<ArrayBuffer>;
		crusherNode.oversample = "4x";

		gainNode = ctx.createGain();
		gainNode.gain.value = 0;

		source.connect(crusherNode);
		crusherNode.connect(gainNode);
		gainNode.connect(ctx.destination);
	}

	async function load(ytUrl: string) {
		teardown();
		status = "loading";
		song = null;
		lyrics = [];

		const { data, error } = await client.GET("/song/{id}", {
			params: { path: { id: ytUrl } },
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
		if (!gainNode) return;
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE_SEC);
	}

	function pause() {
		if (!gainNode) return;
		const ctx = Tone.getContext().rawContext as AudioContext;
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_SEC);
		setTimeout(() => audioEl.pause(), FADE_SEC * 1000);
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

	function toggle16bit() {
		is16bit = !is16bit;
		if (crusherNode)
			crusherNode.curve = makeCrusherCurve(is16bit ? 4 : 16) as Float32Array<ArrayBuffer>;
	}

	return {
		/** Always the same element — safe to pass as a prop without null checks. */
		audioEl,
		get song() { return song; },
		get lyrics() { return lyrics; },
		get status() { return status; },
		get is16bit() { return is16bit; },
		load,
		play,
		pause,
		seekTo,
		currentTime,
		duration,
		toggle16bit,
	};
}