import { access } from "node:fs/promises";
import {
	findSongByFilename,
	findSongByTitle,
} from "@/modules/song/local-song.repository";
import type { Lyric, LyricBaseProvider } from "@/modules/song/song.types";
import { filenameHash, lrcToPlain, safeFilename } from "@/utils/file";

const SONG_PATH = `${process.cwd()}/public/songs`;

export function LocalLyricProvider(): LyricBaseProvider {
	async function getLyrics(
		filename: string,
		_duration: number,
	): Promise<Lyric[]> {
		const safeFile = safeFilename(filename);
		const row =
			(await findSongByFilename(safeFile)) ?? (await findSongByTitle(filename));
		if (!row?.lrcFilename) return [];

		const lrcPath = `${SONG_PATH}/${row.lrcFilename}`;
		const file = Bun.file(lrcPath);
		if (!(await file.exists())) return [];

		const syncedLyrics = await file.text();

		return [
			{
				id: filenameHash(row.lrcFilename),
				name: row.lrcFilename,
				trackName: row.title,
				artistName: row.artist ?? "",
				albumName: "",
				duration: row.duration ?? 0,
				instrumental: false,
				plainLyrics: lrcToPlain(syncedLyrics),
				syncedLyrics,
			},
		];
	}

	async function validate(): Promise<{ ok: boolean; reason?: string }> {
		try {
			await access(SONG_PATH);
			return { ok: true };
		} catch {
			return {
				ok: false,
				reason: `Song directory not accessible: ${SONG_PATH}`,
			};
		}
	}

	return { id: "local-lyric", getLyrics, validate };
}
