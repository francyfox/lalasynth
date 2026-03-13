import { settingsStore } from "@/lib/stores/settings.svelte";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const FADE_MS = 1000;

function createBgAudioStore() {
	const audioEl = new Audio();
	audioEl.loop = true;
	audioEl.volume = 0;

	let current = $state<string | null>(null);
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

	async function play(name: string) {
		if (current === name && !audioEl.paused) return;

		const url = `${API_BASE}/static/sounds/${name}.webm`;

		if (current !== name) {
			fadeTo(0, async () => {
				audioEl.src = url;
				audioEl.load();
				current = name;
				try {
					await audioEl.play();
					fadeTo(masterVolume());
				} catch {
					// autoplay blocked
				}
			});
		} else {
			try {
				await audioEl.play();
				fadeTo(masterVolume());
			} catch {
				// autoplay blocked
			}
		}
	}

	function stop() {
		fadeTo(0, () => {
			audioEl.pause();
		});
		current = null;
	}

	// Sync volume when settings change
	$effect.root(() => {
		$effect(() => {
			void settingsStore.volume;
			if (!audioEl.paused) fadeTo(masterVolume());
		});
	});

	return {
		get current() { return current; },
		play,
		stop,
	};
}

export const bgAudioStore = createBgAudioStore();