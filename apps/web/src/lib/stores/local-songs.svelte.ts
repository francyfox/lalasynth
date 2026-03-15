import { createQuery } from "@tanstack/svelte-query";
import { client } from "@/lib/api";

export interface LocalSongItem {
	filename: string;
	title: string;
	artist: string | null;
	albumArt: string | null;
	duration: number | null;
	lrcFilename: string | null;
}

interface LocalSongResponse {
	items: LocalSongItem[];
	total: number;
	limit: number;
	offset: number;
}

export const LOCAL_SONG_PAGE_SIZE = 8;

export function createLocalSongStore(
	params: () => { search: string; page: number },
) {
	const query = createQuery<LocalSongResponse>(() => {
		const { search, page } = params();
		const offset = (page - 1) * LOCAL_SONG_PAGE_SIZE;
		return {
			queryKey: ["local-songs", search, page],
			queryFn: async () => {
				const title = encodeURIComponent(search);
				const { data } = await client.GET("/song/local", {
					params: {
						query: {
							title,
							limit: LOCAL_SONG_PAGE_SIZE,
							offset,
						},
					},
				});

				if (!data) throw new Error("Failed to fetch local songs");

				return data as LocalSongResponse;
			},
		};
	});

	return {
		query,
		getItems() {
			return query.data?.items ?? [];
		},
		getTotal() {
			return query.data?.total ?? 0;
		},
		isLoading() {
			return query.isLoading;
		},
	};
}
