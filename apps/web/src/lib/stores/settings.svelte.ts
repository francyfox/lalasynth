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
	let sound = $state<boolean>(get("lala.sound") !== "false");
	let volume = $state<number>(Number(get("lala.volume") ?? 80));
	let uwu = $state<boolean>(get("lala.uwu") === "true");

	return {
		get resolution() {
			return resolution;
		},
		set resolution(v: Resolution) {
			resolution = v;
			set("lala.resolution", v);
		},

		get sound() {
			return sound;
		},
		set sound(v: boolean) {
			sound = v;
			set("lala.sound", String(v));
		},

		get volume() {
			return volume;
		},
		set volume(v: number) {
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
	};
}

export const settingsStore = createSettingsStore();