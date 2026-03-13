export type Resolution = "native" | "1920x1080" | "1280x720" | "1024x768" | "800x600";

function get(key: string): string | null {
	if (typeof localStorage === "undefined") return null;
	return localStorage.getItem(key);
}

function set(key: string, value: string) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(key, value);
}

function createSettingsStore() {
	let resolution = $state<Resolution>(
		(get("lala.resolution") as Resolution) ?? "native",
	);
	let volume = $state<number>(Number(get("lala.volume") ?? 80));
	let prevVolume = $state<number>(volume || 80);
	let uwu = $state<boolean>(get("lala.uwu") === "true");
	let hints = $state<boolean>(get("lala.hints") !== "false");

	return {
		get resolution() {
			return resolution;
		},
		set resolution(v: Resolution) {
			resolution = v;
			set("lala.resolution", v);
		},

		/** Derived: true when volume > 0 */
		get sound() {
			return volume > 0;
		},
		/** Toggling sound mutes/unmutes — does not stop playback */
		set sound(v: boolean) {
			if (!v) {
				prevVolume = volume || 80;
				volume = 0;
			} else {
				volume = prevVolume;
			}
			set("lala.volume", String(volume));
		},

		get volume() {
			return volume;
		},
		set volume(v: number) {
			if (v > 0) prevVolume = v;
			volume = v;
			set("lala.volume", String(v));
		},

		get uwu() {
			return uwu;
		},
		set uwu(v: boolean) {
			uwu = v;
			set("lala.uwu", String(v));
		},

		get hints() {
			return hints;
		},
		set hints(v: boolean) {
			hints = v;
			set("lala.hints", String(v));
		},
	};
}

export const settingsStore = createSettingsStore();