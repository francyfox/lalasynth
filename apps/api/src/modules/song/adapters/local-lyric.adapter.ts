import { access } from "node:fs/promises";
import { file } from "bun";
import { findSongByFilename } from "@/modules/song/local-song.repository";
import type { Lyric, LyricBaseProvider } from "@/modules/song/song.types";

const SONG_PATH = `${process.cwd()}/public/songs`;

export function LocalLyricProvider(): LyricBaseProvider {
	function safeFilename(name: string): string {
		return name.replace(/^.*[\\/]/, "");
	}

	async function getLyrics(filename: string, _duration: number): Promise<Lyric[]> {
		const safeFile = safeFilename(filename);
		const row = await findSongByFilename(safeFile);
		if (!row?.lrcFilename) return [];

		const lrcPath = `${SONG_PATH}/${row.lrcFilename}`;
		const f = file(lrcPath);
		if (!(await f.exists())) return [];

		const syncedLyrics = await f.text();

		return [
			{
				id: 0,
				name: row.lrcFilename,
				trackName: row.title,
				artistName: row.artist ?? "",
				albumName: "",
				duration: row.duration ?? 0,
				instrumental: false,
				plainLyrics: null,
				syncedLyrics,
			},
		];
	}

	async function validate(): Promise<{ ok: boolean; reason?: string }> {
		try {
			await access(SONG_PATH);
			return { ok: true };
		} catch {
			return { ok: false, reason: `Song directory not accessible: ${SONG_PATH}` };
		}
	}

	return { id: "local-lyric", getLyrics, validate };
}
