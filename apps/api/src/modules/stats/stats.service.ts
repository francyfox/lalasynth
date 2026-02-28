import fs from "node:fs";
import os from "node:os";
import { env } from "@/env";
import { TURSO_LIMITS } from "@/modules/stats/stats.const";

const TURSO_CACHE_TTL = 60_000;
let tursoCache: { data: { read: number; write: number; storage: number }; ts: number } | null = null;

export const StatsService = () => {
	function getSystemStats() {
		let totalMemoryBytes: number;

		try {
			const limit = fs.readFileSync("/sys/fs/cgroup/memory.max", "utf8");
			totalMemoryBytes = parseInt(limit, 10);

			if (Number.isNaN(totalMemoryBytes)) {
				totalMemoryBytes = os.totalmem();
			}
		} catch {
			totalMemoryBytes = os.totalmem();
		}

		const usedMemoryBytes = process.memoryUsage().rss;

		const memoryPercentage = Math.min(
			Math.round((usedMemoryBytes / totalMemoryBytes) * 10000) / 100,
			100,
		);

		const cpus = os.cpus().length;
		const loadAvg = os.loadavg()[0];
		const cpuPercentage = Math.min(Math.round((loadAvg / cpus) * 10000) / 100, 100);

		return {
			cpu: cpuPercentage,
			memory: memoryPercentage,
		};
	}

	async function getUsagePercents() {
		if (tursoCache && Date.now() - tursoCache.ts < TURSO_CACHE_TTL) {
			return tursoCache.data;
		}

		const res = await fetch(
			`https://api.turso.tech/v1/organizations/${env.TURSO_ORG_NAME}/databases/${env.TURSO_DB_NAME}/usage`,
			{
				headers: { Authorization: `Bearer ${env.TURSO_API_TOKEN}` },
			},
		);

		const { total } = await res.json();

		const data = {
			read: Math.round((total.rows_read / TURSO_LIMITS.rows_read) * 10000) / 100,
			write: Math.round((total.rows_written / TURSO_LIMITS.rows_written) * 10000) / 100,
			storage: Math.round((total.storage_bytes / TURSO_LIMITS.storage_bytes) * 10000) / 100,
		};

		tursoCache = { data, ts: Date.now() };

		return data;
	}

	return {
		getAllStats: async () => {
			const systemStats = getSystemStats();
			const turso = await getUsagePercents();
			return {
				...systemStats,
				turso,
			};
		},
	};
};
