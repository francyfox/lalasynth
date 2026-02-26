import type { Scene } from "@app/src/modules/scenes/scenes.types";
import { createQuery } from "@tanstack/svelte-query";
import { toast } from "svelte-sonner";
import { client } from "@/lib/api";

export const getScenesStore = () => {
	const query = createQuery<Scene[]>(() => ({
		queryKey: ["scenes"],
		queryFn: async () => {
			const { data, error } = await client.GET("/scenes");
			if (error) {
				toast.error((error as unknown as Error).message);
				return [];
			}
			return data || [];
		},
		staleTime: 1000 * 60 * 8,
	}));

	return {
		query,
		getSceneById: (id: number) => {
			const scenes = query.data;
			if (!Array.isArray(scenes)) return undefined;
			return scenes.find((i) => i.id === id);
		},
		getSceneByName: (name: string) => {
			const scenes = query.data;
			if (!Array.isArray(scenes)) return undefined;
			return scenes.find((i) => i.name === name);
		},
	};
};
