import { hostname } from "node:os";
import { env } from "@/env";

const HEARTBEAT_INTERVAL_MS = 30_000;
const VERSION = "1.0.0";

let serverId: string | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

type Status = "idle" | "playing";
let currentStatus: Status = "idle";
let currentPlayerCount = 0;

export function setServerStatus(status: Status, playerCount: number) {
	currentStatus = status;
	currentPlayerCount = playerCount;
}

export async function registerOnMaster(publicUrl: string): Promise<void> {
	if (!env.MASTER_URL) return;

	try {
		const res = await fetch(`${env.MASTER_URL}/servers/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: env.SERVER_NAME ?? hostname(),
				url: publicUrl,
				version: VERSION,
				maxPlayers: env.MAX_PLAYERS,
			}),
		});

		if (!res.ok) {
			console.warn(`[master] Registration failed: HTTP ${res.status}`);
			return;
		}

		const data = await res.json() as { id: string };
		serverId = data.id;
		console.log(`[master] Registered as ${serverId} at ${env.MASTER_URL}`);

		heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
	} catch (err) {
		console.warn(`[master] Registration error: ${err}`);
	}
}

async function sendHeartbeat(): Promise<void> {
	if (!serverId || !env.MASTER_URL) return;

	try {
		await fetch(`${env.MASTER_URL}/servers/${serverId}/heartbeat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				playerCount: currentPlayerCount,
				status: currentStatus,
			}),
		});
	} catch {
		// silently ignore — server might be temporarily unreachable
	}
}

export async function unregisterFromMaster(): Promise<void> {
	if (heartbeatTimer) {
		clearInterval(heartbeatTimer);
		heartbeatTimer = null;
	}

	if (!serverId || !env.MASTER_URL) return;

	try {
		await fetch(`${env.MASTER_URL}/servers/${serverId}`, {
			method: "DELETE",
		});
		console.log("[master] Unregistered");
	} catch {
		// best-effort
	}
}
