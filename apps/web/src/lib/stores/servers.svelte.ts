import { env } from "@/env";

export type GameServer = {
	id: string;
	name: string;
	url: string;
	version: string;
	playerCount: number;
	maxPlayers: number;
	status: "idle" | "playing" | "offline";
	registeredAt: number;
	lastHeartbeatAt: number;
};

type WsMessage = { type: "servers"; data: GameServer[] };

function createServersStore() {
	let servers = $state<GameServer[]>([]);
	let ws: WebSocket | null = null;
	let retryDelay = 1000;
	let retryTimer: ReturnType<typeof setTimeout> | null = null;
	let stopped = false;

	function connect() {
		if (stopped) return;

		const url = env.VITE_MASTER_URL.replace(/^http/, "ws") + "/servers/ws";
		ws = new WebSocket(url);

		ws.onmessage = (e) => {
			try {
				const msg = JSON.parse(e.data) as WsMessage;
				if (msg.type === "servers") {
					servers = msg.data;
				}
			} catch {}
		};

		ws.onopen = () => {
			retryDelay = 1000;
		};

		ws.onclose = () => {
			if (stopped) return;
			retryTimer = setTimeout(() => {
				retryDelay = Math.min(retryDelay * 2, 30_000);
				connect();
			}, retryDelay);
		};

		ws.onerror = () => ws?.close();
	}

	function disconnect() {
		stopped = true;
		if (retryTimer) clearTimeout(retryTimer);
		ws?.close();
		ws = null;
	}

	return {
		get list() {
			return servers;
		},
		connect,
		disconnect,
	};
}

export const serversStore = createServersStore();
