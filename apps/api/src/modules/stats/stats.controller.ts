import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { StatsSchema } from "@/modules/stats/stats.schema";
import { StatsService } from "@/modules/stats/stats.service";

export const StatsController = new Elysia({ name: "Stats.Controller" })
	.use(rateLimit({ max: 60, duration: 60000 }))
	.get(
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
