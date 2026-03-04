<script lang="ts">
	import { onDestroy } from "svelte";
	import type { LyricLine } from './lyric-sync.types.ts'

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
		onOffsetChange?: (offset: number) => void;
	}

	const { audioEl, duration, lyrics, analyserNode, onOffsetChange }: Props = $props();

	// ── state ─────────────────────────────────────────────────────────────
	let offset = $state(0);
	let playing = $state(false);
	let currentTime = $state(0);
	let canvas = $state<HTMLCanvasElement | null>(null);

	// ── audio nodes ───────────────────────────────────────────────────────
	let internalCtx: AudioContext | null = null;
	let analyser = $state<AnalyserNode | null>(null);
	let rafId: number | null = null;
	let isDragging = false;

	$effect(() => {
		console.log(audioEl)
		if (!audioEl) return;
		// Use the externally provided analyser if available
		if (analyserNode) {
			analyser = analyserNode;
			startRaf();
			return () => {
				stopRaf();
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

		startRaf();

		return () => {
			stopRaf();
			internalCtx?.close();
			internalCtx = null;
			analyser = null;
		};
	});

	$effect(() => {
		if (!audioEl) return;
		const onEnded = () => { playing = false; };
		audioEl.addEventListener("ended", onEnded);
		return () => audioEl?.removeEventListener("ended", onEnded);
	});

	// ── render loop ───────────────────────────────────────────────────────
	function startRaf() {
		function tick() {
			currentTime = audioEl.currentTime;
			if (canvas) draw(canvas);
			rafId = requestAnimationFrame(tick);
		}
		rafId = requestAnimationFrame(tick);
	}

	function stopRaf() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	// ── canvas drawing ────────────────────────────────────────────────────
	const WAVE_RATIO = 0.58;
	const COLORS = {
		bg: "#0d0f1a",
		timelineBg: "#13162a",
		waveStroke: "#818cf8",
		waveCenter: "#1e2030",
		progress: "rgba(79,70,229,0.25)",
		tick: "#374151",
		tickLabel: "#6b7280",
		cursor: "rgba(255,255,255,0.9)",
		offset: "#f59e0b",
		offsetLabel: "#fbbf24",
	};

	function draw(cvs: HTMLCanvasElement) {
		// Sync canvas pixel size to CSS size for crisp rendering
		const dpr = window.devicePixelRatio || 1;
		const cssW = cvs.clientWidth;
		const cssH = cvs.clientHeight;
		if (cvs.width !== cssW * dpr) {
			cvs.width = cssW * dpr;
			cvs.height = cssH * dpr;
		}

		const ctx = cvs.getContext("2d");
		if (!ctx || !analyser) return;

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const w = cssW;
		const h = cssH;

		const WAVE_H = Math.floor(h * WAVE_RATIO);
		const TL_Y = WAVE_H;
		const TL_H = h - WAVE_H;

		ctx.fillStyle = COLORS.bg;
		ctx.fillRect(0, 0, w, h);

		// ── Waveform ──────────────────────────────────────────────────
		const bufLen = analyser.frequencyBinCount;
		const waveData = new Uint8Array(bufLen);
		analyser.getByteTimeDomainData(waveData);

		// Fill under the waveform
		ctx.beginPath();
		ctx.fillStyle = "rgba(99,102,241,0.08)";
		const mid = WAVE_H / 2;
		ctx.moveTo(0, mid);
		for (let i = 0; i < bufLen; i++) {
			const x = (i / (bufLen - 1)) * w;
			const y = ((waveData[i] / 128.0) - 1) * mid + mid;
			ctx.lineTo(x, y);
		}
		ctx.lineTo(w, mid);
		ctx.closePath();
		ctx.fill();

		// Stroke
		ctx.beginPath();
		ctx.strokeStyle = COLORS.waveStroke;
		ctx.lineWidth = 1.5;
		for (let i = 0; i < bufLen; i++) {
			const x = (i / (bufLen - 1)) * w;
			const y = ((waveData[i] / 128.0) - 1) * mid + mid;
			i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
		}
		ctx.stroke();

		// Center line
		ctx.strokeStyle = COLORS.waveCenter;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, mid);
		ctx.lineTo(w, mid);
		ctx.stroke();

		// ── Timeline strip ────────────────────────────────────────────
		ctx.fillStyle = COLORS.timelineBg;
		ctx.fillRect(0, TL_Y, w, TL_H);

		// Playback progress fill
		if (duration > 0) {
			const prog = (currentTime / duration) * w;
			ctx.fillStyle = COLORS.progress;
			ctx.fillRect(0, TL_Y, prog, TL_H);
		}

		// Time ticks + labels
		const interval = pickInterval(duration);
		ctx.font = `${Math.round(9 * dpr) / dpr}px monospace`;
		ctx.textBaseline = "top";
		for (let t = 0; t <= duration; t += interval) {
			const x = duration > 0 ? (t / duration) * w : 0;
			ctx.fillStyle = COLORS.tick;
			ctx.fillRect(x, TL_Y, 1, 6);
			ctx.fillStyle = COLORS.tickLabel;
			ctx.fillText(formatTime(t), x + 2, TL_Y + 8);
		}

		// ── Offset marker ─────────────────────────────────────────────
		if (duration > 0) {
			const ox = (offset / duration) * w;

			ctx.save();
			ctx.strokeStyle = COLORS.offset;
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 3]);
			ctx.beginPath();
			ctx.moveTo(ox, 0);
			ctx.lineTo(ox, h);
			ctx.stroke();
			ctx.setLineDash([]);

			// Handle dot on the timeline strip
			ctx.fillStyle = COLORS.offset;
			ctx.beginPath();
			ctx.arc(ox, TL_Y + TL_H / 2, 5, 0, Math.PI * 2);
			ctx.fill();

			// Label
			const labelX = ox + 8 > w - 60 ? ox - 64 : ox + 8;
			ctx.fillStyle = COLORS.offsetLabel;
			ctx.font = `bold ${Math.round(10 * dpr) / dpr}px monospace`;
			ctx.fillText(`${offset >= 0 ? "+" : ""}${offset.toFixed(2)}s`, labelX, 4);
			ctx.restore();
		}

		// ── Playback cursor ───────────────────────────────────────────
		if (duration > 0) {
			const cx = (currentTime / duration) * w;
			ctx.strokeStyle = COLORS.cursor;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(cx, 0);
			ctx.lineTo(cx, WAVE_H);
			ctx.stroke();

			// Time tooltip
			const labelX = cx + 4 > w - 44 ? cx - 44 : cx + 4;
			ctx.fillStyle = COLORS.cursor;
			ctx.font = `${Math.round(10 * dpr) / dpr}px monospace`;
			ctx.fillText(formatTime(currentTime), labelX, 4);
		}
	}

	function pickInterval(dur: number): number {
		if (dur <= 0) return 10;
		if (dur < 30) return 5;
		if (dur < 120) return 10;
		if (dur < 300) return 30;
		return 60;
	}

	function formatTime(s: number): string {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, "0")}`;
	}

	// ── controls ──────────────────────────────────────────────────────────
	async function togglePlay() {
		// Resume whichever AudioContext owns this element
		const ctx = internalCtx ?? (analyserNode ? (analyserNode.context as AudioContext) : null);
		if (ctx?.state === "suspended") await ctx.resume();
		if (playing) {
			audioEl.pause();
			playing = false;
		} else {
			await audioEl.play();
			playing = true;
		}
	}

	function markNow() {
		setOffset(currentTime);
	}

	function onOffsetInput(e: Event) {
		const val = parseFloat((e.currentTarget as HTMLInputElement).value);
		if (!isNaN(val)) setOffset(val);
	}

	function setOffset(val: number) {
		offset = Math.max(0, Math.min(val, duration || val));
		onOffsetChange?.(offset);
	}

	// ── canvas pointer events ─────────────────────────────────────────────
	function clientXToTime(clientX: number): number {
		if (!canvas || duration <= 0) return 0;
		const rect = canvas.getBoundingClientRect();
		const rel = Math.max(0, Math.min(clientX - rect.left, rect.width));
		return (rel / rect.width) * duration;
	}

	function onPointerDown(e: PointerEvent) {
		isDragging = true;
		canvas?.setPointerCapture(e.pointerId);
		setOffset(clientXToTime(e.clientX));
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		setOffset(clientXToTime(e.clientX));
	}

	function onPointerUp() {
		isDragging = false;
	}

	// ── derived: current + surrounding lines ──────────────────────────────
	const activeIndex = $derived.by(() => {
		const t = currentTime - offset;
		if (t < 0) return -1;
		let idx = -1;
		for (let i = 0; i < lyrics.length; i++) {
			if (lyrics[i].start <= t) idx = i;
			else break;
		}
		return idx;
	});

	const visibleLines = $derived.by(() => {
		if (activeIndex < 0) return lyrics.slice(0, 5).map((l, i) => ({ ...l, rel: i }));
		const start = Math.max(0, activeIndex - 2);
		const end = Math.min(lyrics.length, activeIndex + 4);
		return lyrics.slice(start, end).map((l, i) => ({ ...l, rel: i - Math.min(2, activeIndex) }));
	});

	onDestroy(() => {
		stopRaf();
		internalCtx?.close();
	});
</script>

<div class="card bg-base-200 shadow-xl w-full select-none">
	<div class="card-body p-4 gap-3">

		<!-- Waveform / Timeline canvas -->
		<div class="relative rounded-lg overflow-hidden border border-base-content/10" style="height: 120px">
			<canvas
				bind:this={canvas}
				class="absolute inset-0 w-full h-full cursor-col-resize"
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onpointerleave={onPointerUp}
			></canvas>
		</div>

		<!-- Controls row -->
		<div class="flex items-center gap-3 flex-wrap">
			<button
				class="btn btn-sm {playing ? 'btn-warning' : 'btn-primary'}"
				onclick={togglePlay}
			>
				{#if playing}
					<svg xmlns="http://www.w3.org/2000/svg" class="size-4 fill-current" viewBox="0 0 24 24">
						<rect x="6" y="4" width="4" height="16"/>
						<rect x="14" y="4" width="4" height="16"/>
					</svg>
					Pause
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="size-4 fill-current" viewBox="0 0 24 24">
						<path d="M8 5v14l11-7z"/>
					</svg>
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