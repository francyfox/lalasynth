import fs from "node:fs";
import os from "node:os";
import { TURSO_LIMITS } from "@/modules/stats/stats.const";

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
			Math.round((usedMemoryBytes / totalMemoryBytes) * 100),
			100,
		);

		const cpus = os.cpus().length;
		const loadAvg = os.loadavg()[0];
		const cpuPercentage = Math.min(Math.round((loadAvg / cpus) * 100), 100);

		return {
			cpu: cpuPercentage,
			memory: memoryPercentage,
		};
	}

	async function getUsagePercents() {
		const res = await fetch(
			"https://api.turso.tech/v1/organizations/{org}/databases/{db}/usage",
			{
				headers: { Authorization: `Bearer ${process.env.TURSO_API_TOKEN}` },
			},
		);

		const { usage } = await res.json();

		return {
			read: (usage.rows_read / TURSO_LIMITS.rows_read) * 100,
			write: (usage.rows_written / TURSO_LIMITS.rows_written) * 100,
			storage: (usage.storage_bytes / TURSO_LIMITS.storage_bytes) * 100,
		};
	}

	return {
		getAllStats: () => {
			return {
				...getSystemStats(),
				turso: getUsagePercents(),
			};
		},
	};
};
