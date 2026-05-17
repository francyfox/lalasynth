import { eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { gameServers, type GameServer } from "./server.schema";

const OFFLINE_THRESHOLD_MS = 90_000;
const PURGE_THRESHOLD_MS = 10 * 60_000;

export function ServerService() {
	async function register(data: {
		name: string;
		url: string;
		version: string;
		maxPlayers: number;
	}): Promise<string> {
		const [row] = await db.insert(gameServers).values(data).returning({ id: gameServers.id });
		return row.id;
	}

	async function heartbeat(
		id: string,
		data: { playerCount: number; status: "idle" | "playing" },
	): Promise<boolean> {
		const result = await db
			.update(gameServers)
			.set({ ...data, lastHeartbeatAt: new Date() })
			.where(eq(gameServers.id, id))
			.returning({ id: gameServers.id });
		return result.length > 0;
	}

	async function unregister(id: string): Promise<void> {
		await db.delete(gameServers).where(eq(gameServers.id, id));
	}

	async function getActive(): Promise<GameServer[]> {
		const threshold = new Date(Date.now() - OFFLINE_THRESHOLD_MS);
		return db.select().from(gameServers).where(gt(gameServers.lastHeartbeatAt, threshold));
	}

	async function cleanup(): Promise<void> {
		const purgeThreshold = new Date(Date.now() - PURGE_THRESHOLD_MS);
		await db.delete(gameServers).where(lt(gameServers.lastHeartbeatAt, purgeThreshold));
	}

	return { register, heartbeat, unregister, getActive, cleanup };
}

export type ServerServiceInstance = ReturnType<typeof ServerService>;
