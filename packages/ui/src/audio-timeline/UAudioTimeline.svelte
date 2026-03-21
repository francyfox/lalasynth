<script lang="ts">
	import { onDestroy, untrack } from "svelte";
	import type { LyricLine } from "../lyric-sync/lyric-sync.types.ts";

	interface Props {
		audioEl: HTMLAudioElement;
		duration: number;
		lyrics: LyricLine[];
		offset: number;
		waveformUrl?: string;
		onSeek?: (time: number) => void;
		onOffsetChange?: (offset: number) => void;
	}

	const { audioEl, duration, lyrics, offset, waveformUrl, onSeek, onOffsetChange }: Props = $props();

	// ── canvas ref & runtime state ────────────────────────────────────────
	let canvas = $state<HTMLCanvasElement | null>(null);
	let currentTime = $state(0);
	let viewStart = $state(0);

	// ── waveform data ──────────────────────────────────────────────────────
	let waveformBars = $state<Float32Array | null>(null);
	let waveformState = $state<"idle" | "loading" | "ready" | "error">("idle");

	// ── drag state ────────────────────────────────────────────────────────
	let dragMode = $state<"seek" | "offset" | "scroll" | null>(null);

	// ── RAF ───────────────────────────────────────────────────────────────
	let rafId: number | null = null;

	// ── layout constants ──────────────────────────────────────────────────
	const WAVE_RATIO = 0.68;
	const NUM_BARS = 800;
	const WINDOW_DURATION = 120; // 2 minutes viewport
	const SCROLL_H = 14; // scrollbar zone height in px

	const COLORS = {
		bg: "#0d0f1a",
		timelineBg: "#0a0c16",
		barPlayed: "#818cf8",
		barUnplayed: "#252740",
		playedOverlay: "rgba(99,102,241,0.08)",
		playheadLine: "rgba(255,255,255,0.9)",
		playheadGlow: "rgba(255,255,255,0.12)",
		tick: "#374151",
		tickLabel: "#6b7280",
		offsetLine: "#f59e0b",
		offsetDiamond: "#f59e0b",
		lyricActive: "#22d3ee",
		lyricInactive: "#164e63",
	} as const;

	// ── viewport helpers ───────────────────────────────────────────────────
	function getWindowDuration() {
		return duration > 0 ? Math.min(WINDOW_DURATION, duration) : WINDOW_DURATION;
	}

	function clampViewStart(v: number) {
		return Math.max(0, Math.min(v, Math.max(0, duration - getWindowDuration())));
	}

	function timeToX(t: number, w: number) {
		return ((t - viewStart) / getWindowDuration()) * w;
	}

	function xToTime(x: number, w: number) {
		return viewStart + (x / w) * getWindowDuration();
	}

	function clientXToTime(clientX: number, element: HTMLCanvasElement): number {
		const rect = element.getBoundingClientRect();
		const rel = Math.max(0, Math.min(clientX - rect.left, rect.width));
		return xToTime(rel, rect.width);
	}

	// ── auto-center viewport on offset changes ────────────────────────────
	$effect(() => {
		const o = offset; // only offset is tracked — dragMode/viewStart are not
		untrack(() => {
			if (duration <= 0) return;
			const winDur = getWindowDuration();
			if (o < viewStart || o > viewStart + winDur) {
				viewStart = clampViewStart(o - winDur / 2);
			}
		});
	});

	// ── wheel to pan ───────────────────────────────────────────────────────
	function onWheel(e: WheelEvent) {
		e.preventDefault();
		const winDur = getWindowDuration();
		const delta = (e.deltaY / 100) * winDur * 0.15;
		viewStart = clampViewStart(viewStart + delta);
	}

	// ── waveform: fast path from API (local songs) ─────────────────────────
	$effect(() => {
		const url = waveformUrl; // tracked — runs when waveformUrl changes
		if (!url) return;
		waveformState = "loading";
		waveformBars = null;
		(async () => {
			try {
				const res = await fetch(url);
				if (res.ok) {
					const { bars } = await res.json() as { bars: number[] };
					if (bars.length > 0) {
						waveformBars = new Float32Array(bars);
						waveformState = "ready";
						return;
					}
				}
			} catch {}
			waveformState = "error";
		})();
	});

	// ── waveform: fallback full-decode (YouTube / no API bars) ─────────────
	$effect(() => {
		if (!audioEl || waveformUrl) return; // skip when API path handles it

		function decode(src: string) {
			if (!src) return;
			startFullDecode(src);
		}

		if (audioEl.src) decode(audioEl.src);
		audioEl.addEventListener("loadstart", () => decode(audioEl.src));
		return () => audioEl.removeEventListener("loadstart", () => decode(audioEl.src));
	});

	function startFullDecode(url: string) {
		waveformState = "loading";
		waveformBars = null;

		(async () => {
			// Fallback: full audio fetch + decode
			let tempCtx: AudioContext | null = null;
			try {
				const response = await fetch(url);
				const arrayBuffer = await response.arrayBuffer();

				tempCtx = new AudioContext();
				const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

				waveformBars = computeWaveformBars(audioBuffer, NUM_BARS);
				waveformState = "ready";
			} catch (err) {
				console.error("[UAudioTimeline] waveform decode failed:", err);
				waveformState = "error";
			} finally {
				tempCtx?.close();
			}
		})();
	}

	function computeWaveformBars(buffer: AudioBuffer, numBars: number): Float32Array {
		const numChannels = buffer.numberOfChannels;
		const totalSamples = buffer.length;
		const samplesPerBar = Math.floor(totalSamples / numBars);
		const bars = new Float32Array(numBars);

		const channels: Float32Array[] = [];
		for (let c = 0; c < numChannels; c++) {
			channels.push(buffer.getChannelData(c));
		}

		for (let b = 0; b < numBars; b++) {
			const start = b * samplesPerBar;
			const end = start + samplesPerBar;
			let sumSq = 0;
			let count = 0;
			for (let i = start; i < end; i++) {
				let avg = 0;
				for (let c = 0; c < numChannels; c++) {
					avg += channels[c][i] ?? 0;
				}
				avg /= numChannels;
				sumSq += avg * avg;
				count++;
			}
			bars[b] = count > 0 ? Math.sqrt(sumSq / count) : 0;
		}

		// Normalize
		let max = 0;
		for (let b = 0; b < numBars; b++) {
			if (bars[b] > max) max = bars[b];
		}
		if (max > 0) {
			for (let b = 0; b < numBars; b++) {
				bars[b] /= max;
			}
		}

		return bars;
	}

	// ── RAF render loop ────────────────────────────────────────────────────
	$effect(() => {
		if (!audioEl) return;

		function tick() {
			currentTime = audioEl.currentTime;
			// Follow playhead when playing and user isn't interacting
			if (!audioEl.paused && dragMode === null) {
				const winDur = getWindowDuration();
				if (currentTime < viewStart || currentTime > viewStart + winDur * 0.9) {
					viewStart = clampViewStart(currentTime - winDur * 0.05);
				}
			}
			if (canvas) draw(canvas);
			rafId = requestAnimationFrame(tick);
		}

		rafId = requestAnimationFrame(tick);

		return () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		};
	});

	// ── drawing ────────────────────────────────────────────────────────────
	function draw(cvs: HTMLCanvasElement) {
		const dpr = window.devicePixelRatio || 1;
		const cssW = cvs.clientWidth;
		const cssH = cvs.clientHeight;

		if (cvs.width !== cssW * dpr || cvs.height !== cssH * dpr) {
			cvs.width = cssW * dpr;
			cvs.height = cssH * dpr;
		}

		const ctx = cvs.getContext("2d");
		if (!ctx) return;

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const w = cssW;
		const h = cssH;

		const contentH = duration > WINDOW_DURATION ? h - SCROLL_H : h;
		const WAVE_H = Math.floor(contentH * WAVE_RATIO);
		const TL_Y = WAVE_H;
		const TL_H = contentH - WAVE_H;

		// ── background ────────────────────────────────────────────────
		ctx.fillStyle = COLORS.bg;
		ctx.fillRect(0, 0, w, WAVE_H);
		ctx.fillStyle = COLORS.timelineBg;
		ctx.fillRect(0, TL_Y, w, TL_H);

		// ── waveform bars ─────────────────────────────────────────────
		const mid = WAVE_H / 2;
		const playX = timeToX(currentTime, w);

		if (waveformState === "loading") {
			ctx.fillStyle = COLORS.tickLabel;
			ctx.font = `11px monospace`;
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";
			ctx.fillText("Loading waveform…", w / 2, mid);
			ctx.textAlign = "left";
		} else if (waveformState === "error") {
			ctx.fillStyle = COLORS.tickLabel;
			ctx.font = `11px monospace`;
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";
			ctx.fillText("Waveform unavailable", w / 2, mid);
			ctx.textAlign = "left";
		} else if (waveformBars) {
			const BAR_W = 2;
			const GAP = 1;
			const STEP = BAR_W + GAP;
			const numVisible = Math.floor(w / STEP);
			const N = waveformBars.length;
			const maxBarH = WAVE_H - 2;
			const winDur = getWindowDuration();
			const barStart = (viewStart / duration) * N;
			const barEnd = ((viewStart + winDur) / duration) * N;

			for (let i = 0; i < numVisible; i++) {
				const x = i * STEP;
				const amp = waveformBars[Math.floor(barStart + (i / numVisible) * (barEnd - barStart))] ?? 0;
				const barH = Math.max(2, amp * maxBarH);
				ctx.fillStyle = x < playX ? COLORS.barPlayed : COLORS.barUnplayed;
				ctx.fillRect(x, WAVE_H - barH, BAR_W, barH);
			}

			// Played-area overlay
			if (playX > 0) {
				ctx.fillStyle = COLORS.playedOverlay;
				ctx.fillRect(0, 0, playX, WAVE_H);
			}
		}

		// ── playhead cursor ───────────────────────────────────────────
		if (duration > 0) {
			const cx = playX;

			// Glow on both sides
			ctx.fillStyle = COLORS.playheadGlow;
			ctx.fillRect(cx - 5, 0, 5, WAVE_H);
			ctx.fillRect(cx + 1, 0, 5, WAVE_H);

			// 1px cursor line
			ctx.fillStyle = COLORS.playheadLine;
			ctx.fillRect(cx, 0, 1, WAVE_H);
		}

		// ── timeline ruler (top of TL strip) ─────────────────────────
		const winDur = getWindowDuration();
		const interval = pickInterval(winDur);
		ctx.font = `9px monospace`;
		ctx.textBaseline = "top";

		for (
			let t = Math.ceil(viewStart / interval) * interval;
			t <= viewStart + winDur;
			t += interval
		) {
			const x = timeToX(t, w);
			ctx.fillStyle = COLORS.tick;
			ctx.fillRect(x, TL_Y + 1, 1, 4);
			ctx.fillStyle = COLORS.tickLabel;
			ctx.fillText(formatTime(t), x + 2, TL_Y + 6);
		}

		// ── lyric markers (above diamond row) ─────────────────────────
		if (duration > 0) {
			const LYRIC_Y = contentH - 14;
			const adjustedTime = currentTime - offset;
			for (const line of lyrics) {
				const mx = timeToX(line.start + offset, w);
				if (mx < 0 || mx > w) continue;
				const isActive = Math.abs(adjustedTime - line.start) < 0.1;
				ctx.fillStyle = isActive ? COLORS.lyricActive : COLORS.lyricInactive;
				ctx.fillRect(mx, LYRIC_Y, 1, 6);
			}
		}

		// ── offset marker ─────────────────────────────────────────────
		if (duration > 0) {
			const ox = Math.round(timeToX(offset, w));

			// Only draw if visible (with margin)
			if (ox >= -2 && ox <= w + 2) {
				// Solid vertical line from diamond up through waveform zone
				ctx.fillStyle = COLORS.offsetLine;
				ctx.fillRect(ox, 0, 2, contentH);

				// Diamond at very bottom of timeline strip
				ctx.save();
				ctx.fillStyle = COLORS.offsetDiamond;
				ctx.translate(ox, contentH - 5);
				ctx.rotate(Math.PI / 4);
				ctx.fillRect(-4, -4, 8, 8);
				ctx.restore();
			}
		}

		// ── mini scrollbar ─────────────────────────────────────────────
		if (duration > WINDOW_DURATION) {
			const sbY = h - SCROLL_H;
			const thumbH = SCROLL_H - 4;
			const thumbY = sbY + 2;

			// Track
			ctx.fillStyle = "#111827";
			ctx.fillRect(0, sbY, w, SCROLL_H);

			// Thumb
			const sbW = Math.max(32, (winDur / duration) * w);
			const sbX = (viewStart / duration) * w;
			const isScrolling = dragMode === "scroll";
			ctx.fillStyle = isScrolling ? "#6366f1" : "#2d3452";
			ctx.fillRect(sbX, thumbY, sbW, thumbH);

			// Grip lines (3 vertical notches centered in thumb)
			const gripColor = isScrolling ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)";
			ctx.fillStyle = gripColor;
			const cx = sbX + sbW / 2;
			const gripH = thumbH - 4;
			const gripY = thumbY + 2;
			for (const dx of [-4, 0, 4]) {
				ctx.fillRect(cx + dx, gripY, 1, gripH);
			}
		}
	}

	// ── helpers ────────────────────────────────────────────────────────────
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

	function getPointerAreaMode(clientY: number, element: HTMLCanvasElement): "seek" | "offset" | "scroll" {
		const rect = element.getBoundingClientRect();
		const relY = clientY - rect.top;
		if (duration > WINDOW_DURATION && relY >= rect.height - SCROLL_H) return "scroll";
		const waveH = rect.height * WAVE_RATIO;
		return relY < waveH ? "seek" : "offset";
	}

	function scrollToPointerX(clientX: number, element: HTMLCanvasElement) {
		const rect = element.getBoundingClientRect();
		const rel = Math.max(0, Math.min(clientX - rect.left, rect.width));
		const ratio = rel / rect.width;
		const winDur = getWindowDuration();
		viewStart = clampViewStart(ratio * duration - winDur / 2);
	}

	// ── pointer events ─────────────────────────────────────────────────────
	function onPointerDown(e: PointerEvent) {
		if (!canvas) return;
		const mode = getPointerAreaMode(e.clientY, canvas);
		dragMode = mode;
		canvas.setPointerCapture(e.pointerId);

		if (mode === "scroll") {
			scrollToPointerX(e.clientX, canvas);
		} else {
			const time = clientXToTime(e.clientX, canvas);
			if (mode === "seek") {
				audioEl.currentTime = time;
				onSeek?.(time);
			} else {
				onOffsetChange?.(time);
			}
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragMode || !canvas) return;
		if (dragMode === "scroll") {
			scrollToPointerX(e.clientX, canvas);
			return;
		}
		const time = clientXToTime(e.clientX, canvas);
		if (dragMode === "seek") {
			audioEl.currentTime = time;
			onSeek?.(time);
		} else {
			onOffsetChange?.(time);
		}
	}

	function onPointerUp() {
		dragMode = null;
	}

	onDestroy(() => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	});
</script>

<div class="relative rounded-lg overflow-hidden border border-base-content/10" style="height: 110px">
	<canvas
		bind:this={canvas}
		class="absolute inset-0 w-full h-full"
		style="cursor: col-resize"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointerleave={onPointerUp}
		onwheel={onWheel}
	></canvas>
</div>