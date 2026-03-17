import { useEventListener } from "runed";
import { toast } from "svelte-sonner";

/** Modifier key aliases */
const MOD   = new Set(["⌘", "cmd", "ctrl", "control", "meta", "mod"]);
const SHIFT = new Set(["shift", "⇧"]);
const ALT   = new Set(["alt", "option", "⌥"]);

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export interface ShortcutOptions {
	/**
	 * Toast message shown after the handler fires.
	 * Pass a string or a function called after handler to produce the message.
	 */
	toast?: string | (() => string);
	/** Skip this shortcut when an input/textarea/select element is focused. Default: true */
	ignoreInputs?: boolean;
}

/**
 * Register a keyboard shortcut that is automatically cleaned up
 * when the calling component is destroyed.
 *
 * @example
 * useKeyboardShortcut(["⌘", "Shift", "S"], () => toggleStats(), { toast: "Stats toggled" });
 * useKeyboardShortcut(["M"], () => { store.mute() }, { toast: () => store.muted ? "Muted" : "Unmuted" });
 * useKeyboardShortcut(["Escape"], () => closeModal());
 */
export function useKeyboardShortcut(
	keys: string[],
	handler: (e: KeyboardEvent) => void,
	options: ShortcutOptions = {},
) {
	const { ignoreInputs = true } = options;
	const lower = keys.map((k) => k.toLowerCase());

	const needsMod   = lower.some((k) => MOD.has(k));
	const needsShift = lower.some((k) => SHIFT.has(k));
	const needsAlt   = lower.some((k) => ALT.has(k));

	const regularKeys = lower.filter(
		(k) => !MOD.has(k) && !SHIFT.has(k) && !ALT.has(k),
	);

	useEventListener(
		() => window,
		"keydown",
		(e: KeyboardEvent) => {
			if (ignoreInputs && INPUT_TAGS.has((document.activeElement?.tagName ?? ""))) return;

			// Cmd/Ctrl: strict match
			if (needsMod !== (e.metaKey || e.ctrlKey)) return;
			// Shift/Alt: only required when declared, not enforced otherwise
			if (needsShift && !e.shiftKey) return;
			if (needsAlt && !e.altKey) return;
			// Skip Cmd/Ctrl combos when not declared (prevents stealing browser shortcuts)
			if (!needsMod && (e.metaKey || e.ctrlKey)) return;

			if (regularKeys.length && e.key.toLowerCase() !== regularKeys[0]) return;

			e.preventDefault();
			handler(e);

			if (options.toast) {
				const message = typeof options.toast === "function"
					? options.toast()
					: options.toast;
				toast.message(message);
			}
		},
	);
}