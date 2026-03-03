import type { Song } from "@app/src/modules/song/song.schema";
import { createQuery } from "@tanstack/svelte-query";
import { client } from "@/lib/api";

export const getSongs = () => {
	const query = createQuery<Song>(() => ({
		query: ["songs"],
		queryFn: async () => {
			const { data, error } = await client.GET("/song/{id}", {
				params: {
					path: {
						id,
					},
				},
			});
		},
	}));
};
