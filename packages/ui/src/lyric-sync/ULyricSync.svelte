<script lang="ts">
	import { onDestroy } from "svelte";
	import { Pause, Play } from "lucide-svelte";
	import type { LyricLine } from './lyric-sync.types.ts'
	import UAudioTimeline from '../audio-timeline/UAudioTimeline.svelte';

	interface Props {
		/** Already-loaded HTMLAudioElement from the song store. */
		audioEl: HTMLAudioElement;
		duration: number;
		lyrics: LyricLine[];
		/**
		 * Optional pre-connected AnalyserNode (e.g. from the store's audio chain).
		 * If omitted, the component creates its own AudioContext and taps into the
		 * element — only safe when the element hasn't been connected yet.
		 */
		analyserNode?: AnalyserNode;
		offset?: number;
		waveformUrl?: string;
		onOffsetChange?: (offset: number) => void;
	}

	const { audioEl, duration, lyrics, analyserNode, offset = 0, waveformUrl, onOffsetChange }: Props = $props();
	let playing = $state(false);
	let currentTime = $state(0);
	let audioReady = $state(false);
	let audioError = $state<string | null>(null);

	// ── audio nodes ───────────────────────────────────────────────────────
	let internalCtx: AudioContext | null = null;
	let analyser = $state<AnalyserNode | null>(null);

	$effect(() => {
		console.log(audioEl)
		if (!audioEl) return;
		// Use the externally provided analyser if available
		if (analyserNode) {
			analyser = analyserNode;
			return () => {
				analyser = null;
			};
		}

		// Otherwise create our own AudioContext and tap into the element.
		// This only works if createMediaElementSource hasn't been called yet.
		try {
			const ctx = new AudioContext();
			const node = ctx.createAnalyser();
			node.fftSize = 512;
			node.smoothingTimeConstant = 0.6;
			const source = ctx.createMediaElementSource(audioEl);
			source.connect(node);
			node.connect(ctx.destination);
			internalCtx = ctx;
			analyser = node;
		} catch {
			// Element already connected to another context — visualisation disabled
			analyser = null;
		}

		return () => {
			internalCtx?.close();
			internalCtx = null;
			analyser = null;
		};
	});

	$effect(() => {
		if (!audioEl) return;

		// Sync initial state
		audioReady = audioEl.readyState >= 3;
		playing = !audioEl.paused;
		audioError = audioEl.error ? (audioEl.error.message || "Audio error") : null;

		const onCanPlay = () => { audioReady = true; audioError = null; };
		const onPlay = () => { playing = true; };
		const onPause = () => { playing = false; };
		const onEnded = () => { playing = false; };
		const onTimeUpdate = () => { currentTime = audioEl.currentTime; };
		const onError = () => {
			audioReady = false;
			playing = false;
			audioError = audioEl.error?.message || "Failed to load audio";
		};

		audioEl.addEventListener("canplay", onCanPlay);
		audioEl.addEventListener("play", onPlay);
		audioEl.addEventListener("pause", onPause);
		audioEl.addEventListener("ended", onEnded);
		audioEl.addEventListener("timeupdate", onTimeUpdate);
		audioEl.addEventListener("error", onError);
		return () => {
			audioEl?.removeEventListener("canplay", onCanPlay);
			audioEl?.removeEventListener("play", onPlay);
			audioEl?.removeEventListener("pause", onPause);
			audioEl?.removeEventListener("ended", onEnded);
			audioEl?.removeEventListener("timeupdate", onTimeUpdate);
			audioEl?.removeEventListener("error", onError);
		};
	});

	// ── controls ──────────────────────────────────────────────────────────
	async function togglePlay() {
		if (!audioReady) return;
		// Resume whichever AudioContext owns this element
		const ctx = internalCtx ?? (analyserNode ? (analyserNode.context as AudioContext) : null);
		if (ctx?.state === "suspended") await ctx.resume();
		if (playing) {
			audioEl.pause();
			playing = false;
		} else {
			try {
				await audioEl.play();
				playing = true;
			} catch (err) {
				audioError = (err as Error).message;
				playing = false;
			}
		}
	}

	function markNow() {
		setOffset(currentTime);
	}

	function resetOffset() {
		setOffset(lyrics[0]?.start ?? 0);
	}

	function formatTime(s: number): string {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, "0")}`;
	}

	function onOffsetInput(e: Event) {
		const val = parseFloat((e.currentTarget as HTMLInputElement).value);
		if (!isNaN(val)) setOffset(val);
	}

	function setOffset(val: number) {
		const clamped = Math.max(0, Math.min(val, duration || val));
		onOffsetChange?.(clamped);
	}

	// ── derived: current + surrounding lines ──────────────────────────────

	onDestroy(() => {
		internalCtx?.close();
	});
</script>

<div class="card bg-base-200 shadow-xl w-full select-none">
	<div class="card-body p-4 gap-3">

		<!-- Waveform / Timeline canvas -->
		<UAudioTimeline
			{audioEl}
			{duration}
			{lyrics}
			{offset}
			{waveformUrl}
			onOffsetChange={setOffset}
			onSeek={(t) => { audioEl.currentTime = t; }}
		/>

		<!-- Controls row -->
		<div class="flex items-center gap-3 flex-wrap">
			{#if audioError}
				<span class="text-error text-xs">{audioError}</span>
			{/if}
			<button
				class="btn btn-sm {playing ? 'btn-warning' : 'btn-primary'}"
				onclick={togglePlay}
				disabled={!audioReady}
			>
				{#if !audioReady}
					<span class="loading loading-spinner loading-xs"></span>
					Loading…
				{:else if playing}
					<Pause class="size-4" />
					Pause
				{:else}
					<Play class="size-4" />
					Play
				{/if}
			</button>

			<button
				class="btn btn-sm btn-accent"
				onclick={markNow}
				title="Set lyric start to current playback position"
			>
				Mark now — {formatTime(currentTime)}
			</button>
			<button
				class="btn btn-sm btn-ghost"
				onclick={resetOffset}
				title="Reset offset to original lyric start"
			>
				Reset
			</button>

			<div class="flex items-center gap-2 ml-auto">
				<span class="text-xs text-base-content/50">Offset</span>
				<input
					type="number"
					class="input input-sm input-bordered w-24 text-amber-400 font-mono"
					step="0.1"
					value={offset}
					oninput={onOffsetInput}
				/>
				<span class="text-xs text-base-content/50">s</span>
			</div>
		</div>

		<!-- Hint -->
		<p class="text-xs text-base-content/40">
			Drag the <span class="text-amber-400 font-semibold">amber marker</span> on the timeline to set lyric start, or press <kbd class="kbd kbd-xs">Mark now</kbd> at the vocal onset.
		</p>
	</div>
</div>