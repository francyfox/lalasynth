import type { IFader } from "./fader";

export function setupVisibilityFader(fader: IFader, getTarget: () => number): () => void {
	function handler() {
		if (document.hidden) {
			fader.cancel();
			fader.setImmediate(0);
		} else {
			fader.fadeTo(getTarget());
		}
	}
	document.addEventListener("visibilitychange", handler);
	return () => document.removeEventListener("visibilitychange", handler);
}