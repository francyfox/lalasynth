export interface IFader {
	fadeTo(target: number, onDone?: () => void): void;
	cancel(): void;
	setImmediate(value: number): void;
}

const RAF_FADE_MS = 1000;

export function createRafFader(audioEl: HTMLAudioElement): IFader {
	let rafId: number | null = null;

	function cancel() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	function fadeTo(target: number, onDone?: () => void) {
		cancel();
		const start = audioEl.volume;
		if (start === target) {
			onDone?.();
			return;
		}
		const startTime = performance.now();
		function tick(now: number) {
			const t = Math.min((now - startTime) / RAF_FADE_MS, 1);
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

	function setImmediate(value: number) {
		cancel();
		audioEl.volume = value;
	}

	return { fadeTo, cancel, setImmediate };
}

const WEB_AUDIO_FADE_SEC = 0.4;

export function createWebAudioFader(gainNode: GainNode, ctx: AudioContext): IFader {
	let doneTimeout: ReturnType<typeof setTimeout> | null = null;

	function cancel() {
		gainNode.gain.cancelScheduledValues(ctx.currentTime);
		if (doneTimeout !== null) {
			clearTimeout(doneTimeout);
			doneTimeout = null;
		}
	}

	function fadeTo(target: number, onDone?: () => void) {
		cancel();
		const current = gainNode.gain.value;
		gainNode.gain.setValueAtTime(current, ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(target, ctx.currentTime + WEB_AUDIO_FADE_SEC);
		if (onDone) {
			doneTimeout = setTimeout(() => {
				doneTimeout = null;
				onDone();
			}, WEB_AUDIO_FADE_SEC * 1000);
		}
	}

	function setImmediate(value: number) {
		cancel();
		gainNode.gain.setValueAtTime(value, ctx.currentTime);
	}

	return { fadeTo, cancel, setImmediate };
}