import { bgAudioStore } from "@/lib/stores/bg-audio.svelte";

export type HintType = "listen" | "fullscreen";
export type AudioStatus = "allowed" | "blocked" | "allowed-muted";

function getAutoplayStatus(): AudioStatus {
	const nav = navigator as any;
	if (typeof nav.getAutoplayPolicy === "function") {
		const policy: string = nav.getAutoplayPolicy("mediaelement");
		if (policy === "allowed") return "allowed";
		if (policy === "allowed-muted") return "allowed-muted";
		return "blocked";
	}
	// Fallback for Firefox/Safari: rely on actual play result
	if (bgAudioStore.playing) return "allowed";
	return "blocked"; // assume blocked until proven otherwise
}

function createHelperStore() {
	let queue = $state<HintType[]>([]);
	let index = $state(0);
	let open = $state(false);

	let audioStatus = $derived.by((): AudioStatus => getAutoplayStatus());

	return {
		get open() { return open; },
		get current(): HintType | null { return queue[index] ?? null; },
		get hasNext() { return index < queue.length - 1; },
		get step() { return index + 1; },
		get total() { return queue.length; },
		get audioStatus(): AudioStatus { return audioStatus; },

		show(hints: HintType[]) {
			if (hints.length === 0) return;
			queue = hints;
			index = 0;
			open = true;
		},
		next() {
			if (index < queue.length - 1) {
				index++;
			} else {
				this.close();
			}
		},
		close() {
			open = false;
			queue = [];
			index = 0;
			bgAudioStore.resume();
		},
		async retryAudio() {
			await bgAudioStore.resume();
		},
	};
}

export const helperStore = createHelperStore();