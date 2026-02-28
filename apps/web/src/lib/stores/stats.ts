import type { Stats } from "@app/src/modules/stats/stats.schema";
import { createQuery } from "@tanstack/svelte-query";
import { client } from "@/lib/api";

export const getSystemStats = () => {
	return createQuery<Stats>(() => ({
		queryKey: ["stats"],
		queryFn: async () => {
			const { data } = await client.GET("/stats");
			if (!data) throw new Error("Failed to fetch stats");
			return data;
		},
		refetchInterval: 6000,
		refetchIntervalInBackground: false,
	}));
};
