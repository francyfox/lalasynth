import { Elysia } from "elysia";
import { StatsSchema } from "@/modules/stats/stats.schema";
import { StatsService } from "@/modules/stats/stats.service";

export const StatsController = new Elysia({ name: "Stats.Controller" }).get(
	"/stats",
	async () => {
		const stats = StatsService().getAllStats();
		return stats;
	},
	{
		detail: {
			description: "Get the stats",
		},
		response: StatsSchema,
	},
);
