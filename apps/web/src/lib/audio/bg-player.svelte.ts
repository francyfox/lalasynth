import { settingsStore } from "@/lib/stores/settings.svelte";
import type { IBgAudioPlayer } from "./audio.types";
import { createRafFader } from "./fader";
import { setupVisibilityFader } from "./visibility-fader";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function createBgPlayer(): IBgAudioPlayer {
	const audioEl = new Audio();
	audioEl.loop = true;
	audioEl.volume = 0;

	let current = $state<string | null>(null);
	let playing = $state(false);
	let pending = $state<string | null>(null);

	const fader = createRafFader(audioEl);

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
			fader.fadeTo(masterVolume());
		} catch {
			playing = false;
			pending = name;
		}
	}

	async function play(name: string, loop = true) {
		if (current === name && !audioEl.paused) return;
		if (current && !audioEl.paused) {
			fader.fadeTo(0, () => tryPlay(name, loop));
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
		fader.fadeTo(0, () => audioEl.pause());
		current = null;
		playing = false;
		pending = null;
	}

	$effect.root(() => {
		$effect(() => {
			void settingsStore.volume;
			if (!audioEl.paused) fader.fadeTo(masterVolume());
		});

		const cleanupVisibility = setupVisibilityFader(fader, masterVolume);

		return cleanupVisibility;
	});

	return {
		get current() { return current; },
		get playing() { return playing; },
		get pending() { return pending; },
		play,
		resume,
		stop,
	};
}

export type BgPlayer = ReturnType<typeof createBgPlayer>;