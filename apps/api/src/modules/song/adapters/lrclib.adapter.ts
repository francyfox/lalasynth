import { lyricProcessor } from "@/modules/song/lyric-normalize";
import type { Lyric, LyricBaseProvider } from "@/modules/song/song.types";

export const LrclibProvider = (): LyricBaseProvider => {
	async function getLyrics(search: string, duration: number): Promise<Lyric[]> {
		const params = new URLSearchParams({ q: search });
		const response = await fetch(`https://lrclib.net/api/search?${params}`, {
			method: "GET",
		});
		const data = (await response.json()) as Lyric[];

		return data
			.filter((a) => !a.instrumental && a.syncedLyrics)
			.sort(
				(a, b) =>
					Math.abs(a.duration - duration) - Math.abs(b.duration - duration),
			)
			.map((a) => ({
				...a,
				syncedLyrics: lyricProcessor(a.syncedLyrics)
					.normalize()
					.stripPunctuation()
					.splitLongLines()
					.value(),
				plainLyrics: lyricProcessor(a.plainLyrics)
					.normalize()
					.stripPunctuation()
					.value(),
			}));
	}

	async function validate(): Promise<{ ok: boolean; reason?: string }> {
		try {
			const res = await fetch("https://lrclib.net/api/search?q=test");
			if (res.status < 500) return { ok: true };
			return { ok: false, reason: `lrclib.net returned HTTP ${res.status}` };
		} catch (err) {
			return {
				ok: false,
				reason: `lrclib.net unreachable: ${err instanceof Error ? err.message : String(err)}`,
			};
		}
	}

	return {
		id: "lrclib",
		getLyrics,
		validate,
	};
};
