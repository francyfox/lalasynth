import {
	indexSong,
	SONG_PATH,
} from "@/modules/song/adapters/local-audio.adapter";
import { downloadToFile } from "@/modules/song/adapters/ytdlp.adapter";
import {
	findAllSongs,
	findSongByFilename,
	searchByFts,
} from "@/modules/song/local-song.repository";
import { LocalSongBody } from "@/modules/song/local-song.schema";
import { applyLrcOffset, sanitizeFilename } from "@/utils/file";
import { env } from "@/env";

export type SearchLocalSongsOptions = {
	title?: string;
	limit: number;
	offset: number;
};

export const LocalSongService = () => {
	async function searchLocalSongs(options: SearchLocalSongsOptions) {
		const { title, limit, offset } = options;

		const { rows, total } = title
			? await searchByFts(title, limit, offset)
			: await findAllSongs(limit, offset);

		return { items: rows, total, limit, offset };
	}

	async function fetchYoutubeThumbnail(videoId: string): Promise<string | null> {
		try {
			const url = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
			const res = await fetch(url);
			if (!res.ok) return null;
			const buf = await res.arrayBuffer();

			const proc = Bun.spawn(
				["ffmpeg", "-i", "pipe:0", "-vf", "scale=64:64:force_original_aspect_ratio=increase:flags=lanczos,crop=64:64", "-f", "webp", "pipe:1"],
				{ stdin: "pipe", stdout: "pipe", stderr: "ignore" },
			);
			proc.stdin.write(new Uint8Array(buf));
			proc.stdin.end();

			const webp = await new Response(proc.stdout).arrayBuffer();
			if (webp.byteLength === 0) return null;
			return `data:image/webp;base64,${Buffer.from(webp).toString("base64")}`;
		} catch {
			return null;
		}
	}

	async function saveLocalSong({
		videoId,
		title,
		artist,
		syncedLyrics,
		offsetMs,
	}: LocalSongBody) {
		const baseName = sanitizeFilename(artist ? `${artist} - ${title}` : title);
		const audioFilename = `${baseName}.webm`;
		const lrcFilename = `${baseName}.lrc`;
		const audioPath = `${SONG_PATH}/${audioFilename}`;
		const lrcPath = `${SONG_PATH}/${lrcFilename}`;

		// Download audio and thumbnail in parallel
		const existing = await findSongByFilename(audioFilename);
		const [, thumbnailB64] = await Promise.all([
			existing ? Promise.resolve() : downloadToFile(videoId, audioPath, env.LOCAL_SONGS_AUDIO_BITRATE_KBPS),
			fetchYoutubeThumbnail(videoId),
		]);

		// Write LRC with applied offset
		const adjustedLrc = applyLrcOffset(syncedLyrics, offsetMs);
		await Bun.write(lrcPath, adjustedLrc);

		// Index (or re-index) into local_song table
		await indexSong(audioFilename, lrcFilename, thumbnailB64 ?? undefined);

		return { filename: audioFilename, lrcFilename };
	}

	return {
		searchLocalSongs,
		saveLocalSong,
	};
};
