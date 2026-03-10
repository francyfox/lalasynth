import { createQuery } from "@tanstack/svelte-query";

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

export const LOCAL_SONG_PAGE_SIZE = 20;

export function createLocalSongStore(params: () => { search: string; page: number }) {
	const query = createQuery<LocalSongResponse>(() => {
		const { search, page } = params();
		const offset = (page - 1) * LOCAL_SONG_PAGE_SIZE;
		return {
			queryKey: ["local-songs", search, page],
			queryFn: async () => {
				const title = encodeURIComponent(search);
				const res = await fetch(
					`http://localhost:3000/song/local?title=${title}&limit=${LOCAL_SONG_PAGE_SIZE}&offset=${offset}`,
				);
				if (!res.ok) throw new Error("Failed to fetch local songs");
				const data = await res.json();
				return data as LocalSongResponse;
			},
		};
	});

	const items = $derived(query.data?.items ?? []);
	const total = $derived(query.data?.total ?? 0);
	const isLoading = $derived(query.isLoading);

	return { items, total, isLoading };
}