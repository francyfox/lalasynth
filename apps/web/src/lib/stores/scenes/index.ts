import type { Scene } from "@app/src/modules/scenes/scenes.types";
import { createQuery } from "@tanstack/svelte-query";
import { toast } from "svelte-sonner";
import { client } from "@/lib/api";

export const getScenesStore = () => {
	const currentId = $state<number>(0);
	const query = createQuery<Scene>(() => ({
		queryKey: ["scenes"],
		queryFn: async () => {
			const { data, error } = await client.GET("/scenes");
			toast.error((error as unknown as Error).message);

			return data;
		},
	}));

	return {
		query,
		getSceneById: (id: number) =>
			(query.data as Scene[]).find((i) => i.id === id),
		getSceneByName: (name: string) =>
			(query.data as Scene[]).find((i) => i.name === name),
		getCurrentScene: () =>
			$derived((query.data as Scene[]).find((i) => i.id === currentId)),
		getNextScene: () =>
			$derived((query.data as Scene[]).find((i) => i.id === currentId)),
	};
};
