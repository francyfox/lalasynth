const STORAGE_KEY = "activeServer";

export type ActiveServer = {
	id: string;
	name: string;
	url: string;
};

function createActiveServerStore() {
	function load(): ActiveServer | null {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? (JSON.parse(raw) as ActiveServer) : null;
		} catch {
			return null;
		}
	}

	let server = $state<ActiveServer | null>(load());

	return {
		get current() {
			return server;
		},
		set(s: ActiveServer) {
			server = s;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
		},
		clear() {
			server = null;
			localStorage.removeItem(STORAGE_KEY);
		},
	};
}

export const activeServer = createActiveServerStore();
