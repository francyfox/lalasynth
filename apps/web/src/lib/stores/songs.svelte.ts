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
	let song = $state<Song | null>(null);
	let lyrics = $state<Lyric[]>([]);
	let status = $state<PlayerState>("idle");
	let is16bit = $state(false);

	let audioEl: HTMLAudioElement | null = null;
	let gainNode: GainNode | null = null;
	let crusherNode: WaveShaperNode | null = null;
	let chainBuilt = false;

	function teardown() {
		audioEl?.pause();
		if (audioEl) audioEl.src = "";
		audioEl = null;
		gainNode?.disconnect();
		gainNode = null;
		crusherNode?.disconnect();
		crusherNode = null;
		chainBuilt = false;
	}

	function buildChain(el: HTMLAudioElement) {
		if (chainBuilt) return;
		chainBuilt = true;
		const ctx = Tone.getContext().rawContext as AudioContext;
		const source = ctx.createMediaElementSource(el);

		crusherNode = ctx.createWaveShaper();
		crusherNode.curve = makeCrusherCurve(
			is16bit ? 4 : 16,
		) as Float32Array<ArrayBuffer>;
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

		const { data, error } = await client.GET("/song/{id}", {
			params: { path: { id: ytUrl } },
		});

		if (error || !data) {
			status = "error";
			return;
		}

		song = data.song;
		lyrics = data.lyrics;

		const el = new Audio();
		el.addEventListener(
			"canplay",
			() => {
				status = "ready";
			},
			{ once: true },
		);
		el.addEventListener(
			"error",
			(e) => {
				console.log(e);
				status = "error";
			},
			{ once: true },
		);
		audioEl = el;
		el.src = `/song/stream/${data.song.videoId}`;
		el.load();
	}

	async function play() {
		if (!audioEl) return;
		await Tone.start();
		buildChain(audioEl);
		const ctx = Tone.getContext().rawContext as AudioContext;
		await audioEl.play();
		if (!gainNode) return;
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE_SEC);
	}

	function pause() {
		if (!audioEl || !gainNode) return;
		const ctx = Tone.getContext().rawContext as AudioContext;
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_SEC);
		setTimeout(() => audioEl?.pause(), FADE_SEC * 1000);
	}

	function seekTo(seconds: number) {
		if (audioEl) audioEl.currentTime = seconds;
	}

	function currentTime() {
		return audioEl?.currentTime ?? 0;
	}
	function duration() {
		return audioEl?.duration ?? 0;
	}

	function toggle16bit() {
		is16bit = !is16bit;
		if (crusherNode)
			crusherNode.curve = makeCrusherCurve(
				is16bit ? 4 : 16,
			) as Float32Array<ArrayBuffer>;
	}

	return {
		get song() {
			return song;
		},
		get lyrics() {
			return lyrics;
		},
		get status() {
			return status;
		},
		get is16bit() {
			return is16bit;
		},
		load,
		play,
		pause,
		seekTo,
		currentTime,
		duration,
		toggle16bit,
	};
}
