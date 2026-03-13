export type HintType = "listen" | "fullscreen";
export type AudioStatus = "checking" | "allowed" | "blocked";

function createHelperStore() {
	let queue = $state<HintType[]>([]);
	let index = $state(0);
	let open = $state(false);
	let audioStatus = $state<AudioStatus>("checking");

	async function checkAutoplay() {
		// Chrome 100+ has getAutoplayPolicy
		if ("getAutoplayPolicy" in navigator) {
			const policy = (navigator as any).getAutoplayPolicy("mediaelement");
			audioStatus = policy === "allowed" ? "allowed" : "blocked";
			return;
		}
		// Fallback: try playing a silent audio element
		try {
			const audio = new Audio();
			audio.volume = 0;
			audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAA==";
			await audio.play();
			audio.pause();
			audioStatus = "allowed";
		} catch {
			audioStatus = "blocked";
		}
	}

	checkAutoplay();

	return {
		get open() { return open; },
		get current(): HintType | null { return queue[index] ?? null; },
		get hasNext() { return index < queue.length - 1; },
		get step() { return index + 1; },
		get total() { return queue.length; },
		get audioStatus() { return audioStatus; },

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
		},
		async retryAudio() {
			audioStatus = "checking";
			await checkAutoplay();
		},
	};
}

export const helperStore = createHelperStore();