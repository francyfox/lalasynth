import { settingsStore } from "@/lib/stores/settings.svelte";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const FADE_MS = 1000;

function createBgAudioStore() {
	const audioEl = new Audio();
	audioEl.loop = true;
	audioEl.volume = 0;

	let current = $state<string | null>(null);
	let playing = $state(false);
	let pending = $state<string | null>(null);
	let rafId: number | null = null;

	function cancelFade() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	function fadeTo(target: number, onDone?: () => void) {
		cancelFade();
		const start = audioEl.volume;
		if (start === target) {
			onDone?.();
			return;
		}
		const startTime = performance.now();
		function tick(now: number) {
			const t = Math.min((now - startTime) / FADE_MS, 1);
			audioEl.volume = start + (target - start) * t;
			if (t < 1) {
				rafId = requestAnimationFrame(tick);
			} else {
				rafId = null;
				onDone?.();
			}
		}
		rafId = requestAnimationFrame(tick);
	}

	function masterVolume() {
		return settingsStore.volume / 100;
	}

	async function tryPlay(name: string, loop = true) {
		const url = `${API_BASE}/static/sounds/${name}.webm`;
		if (current !== name) {
			audioEl.loop = loop;
			audioEl.src = url;
			audioEl.load();
			current = name;
		}
		try {
			await audioEl.play();
			playing = true;
			pending = null;
			fadeTo(masterVolume());
		} catch {
			playing = false;
			pending = name;
		}
	}

	async function play(name: string, loop = true) {
		if (current === name && !audioEl.paused) return;
		if (current && !audioEl.paused) {
			fadeTo(0, () => tryPlay(name, loop));
		} else {
			await tryPlay(name, loop);
		}
	}

	async function resume() {
		const target = pending ?? current;
		if (!target) return;
		await tryPlay(target);
	}

	function stop() {
		fadeTo(0, () => {
			audioEl.pause();
		});
		current = null;
		playing = false;
		pending = null;
	}

	$effect.root(() => {
		$effect(() => {
			void settingsStore.volume;
			if (!audioEl.paused) fadeTo(masterVolume());
		});

		function onVisibilityChange() {
			if (document.hidden) {
				cancelFade();
				audioEl.volume = 0;
			} else if (!audioEl.paused) {
				fadeTo(masterVolume());
			}
		}
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => document.removeEventListener("visibilitychange", onVisibilityChange);
	});

	return {
		get current() {
			return current;
		},
		get playing() {
			return playing;
		},
		get pending() {
			return pending;
		},
		play,
		resume,
		stop,
	};
}

export const bgAudioStore = createBgAudioStore();
