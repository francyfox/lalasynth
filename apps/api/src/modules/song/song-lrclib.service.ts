import type { Lyric } from "@/modules/song/song.schema";

export const SongLrclibService = () => {
	async function getLyrics(search: string, duration: number): Promise<Lyric[]> {
		const params = new URLSearchParams({ q: search });
		const response = await fetch(`https://lrclib.net/api/search?${params}`, {
			method: "GET",
		});
		const data = (await response.json()) as Lyric[];

		return data.sort((a, b) => {
			const diffA = Math.abs(a.duration - duration);
			const diffB = Math.abs(b.duration - duration);

			return diffA - diffB;
		});
	}

	return {
		getLyrics,
	};
};
