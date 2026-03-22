import type { Stats } from "@app/src/modules/stats/stats.schema";
import { createQuery } from "@tanstack/svelte-query";
import { IsDocumentVisible } from "runed";
import { client } from "@/lib/api";

export const getSystemStats = (enabled?: () => boolean) => {
	const isVisible = new IsDocumentVisible();

	return createQuery<Stats>(() => ({
		queryKey: ["stats"],
		queryFn: async () => {
			const { data } = await client.GET("/stats");
			if (!data) throw new Error("Failed to fetch stats");
			return data;
		},
		refetchInterval: 10000,
		refetchIntervalInBackground: false,
		enabled: isVisible.current && (enabled?.() ?? true),
	}));
};
