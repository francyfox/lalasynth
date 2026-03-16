import { access, mkdir } from "node:fs/promises";
import { file, Glob, spawn } from "bun";
import {
	createFtsTable,
	findExistingArt,
	rebuildFts,
	upsertSong,
} from "@/modules/song/local-song.repository";
import { findSongByFilename } from "@/modules/song/local-song.repository";
import type { AudioBaseProvider, Song } from "@/modules/song/song.types";

const SONG_PATH = `${process.cwd()}/public/songs`;
const AUDIO_EXT = "webm";
const LRC_EXT = "lrc";
const LOCAL_MIME = 'audio/webm; codecs="opus"';

/**
 * Parse "Artist - Title" or just "Title" from a filename (without extension).
 * yt-dlp commonly produces "Artist - Title [videoId]" — strip the bracketed ID first.
 */
function parseFilename(baseName: string): { title: string; artist: string | null } {
	const clean = baseName.replace(/\s*\[[^\]]{5,}\]\s*$/, "").trim();
	const sepIdx = clean.indexOf(" - ");
	if (sepIdx !== -1) {
		return {
			artist: clean.slice(0, sepIdx).trim(),
			title: clean.slice(sepIdx + 3).trim(),
		};
	}
	return { title: clean, artist: null };
}

async function ffprobe(fullPath: string) {
	const proc = spawn(
		["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", fullPath],
		{ stdout: "pipe", stderr: "ignore" },
	);
	const text = await new Response(proc.stdout).text();
	const data = JSON.parse(text) as { format?: { duration?: string; bit_rate?: string } };
	return {
		duration: data.format?.duration ? Math.round(parseFloat(data.format.duration)) : null,
		bitrate: data.format?.bit_rate ? Math.round(parseInt(data.format.bit_rate)) : null,
	};
}

/**
 * Extract the first frame of the VP9 thumbnail track embedded by YouTube Music.
 * yt-dlp's bestaudio[ext=webm] always includes a 500x500 album art video track.
 */
async function extractAlbumArt(fullPath: string): Promise<string | null> {
	try {
		const proc = spawn(
			["ffmpeg", "-i", fullPath, "-vframes", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"],
			{ stdout: "pipe", stderr: "ignore" },
		);
		const buf = await new Response(proc.stdout).arrayBuffer();
		if (buf.byteLength === 0) return null;
		return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
	} catch {
		return null;
	}
}

async function readMetadata(filename: string) {
	const fullPath = `${SONG_PATH}/${filename}`;
	const baseName = filename.replace(/\.[^.]+$/, "");
	const { title, artist } = parseFilename(baseName);

	const [probe, albumArt] = await Promise.all([ffprobe(fullPath), extractAlbumArt(fullPath)]);

	const lrcFilename = (await file(`${SONG_PATH}/${baseName}.${LRC_EXT}`).exists())
		? `${baseName}.${LRC_EXT}`
		: null;

	return { filename, lrcFilename, title, artist, albumArt, ...probe, mimeType: LOCAL_MIME };
}

async function indexSongs(): Promise<void> {
	const glob = new Glob(`*.${AUDIO_EXT}`);

	for await (const filename of glob.scan(SONG_PATH)) {
		const existing = await findExistingArt(filename);
		if (existing?.albumArt) continue;

		try {
			const meta = await readMetadata(filename);
			await upsertSong(meta);
			console.log(`[local-audio] indexed: ${filename}`);
		} catch (err) {
			console.warn(`[local-audio] failed to index ${filename}:`, err);
		}
	}
}

export async function LocalAudioProvider(): Promise<AudioBaseProvider> {
	try {
		await access(SONG_PATH);
	} catch (_) {
		await mkdir(SONG_PATH, { recursive: true });
	}

	await createFtsTable();
	await indexSongs();
	await rebuildFts(); // rebuild from local_song after any new files indexed

	function safeFilename(name: string): string {
		return name.replace(/^.*[\\/]/, "");
	}

	async function getSong(name: string): Promise<Song> {
		const filename = safeFilename(name);
		const row = await findSongByFilename(filename);
		if (!row) throw new Error(`Local song not found: ${filename}`);

		return {
			videoId: row.filename,
			title: row.title,
			author: row.artist ?? undefined,
			duration: row.duration ?? undefined,
			audioUrl: `/songs/${row.filename}`,
			mimeType: row.mimeType,
			bitrate: row.bitrate ?? 0,
		};
	}

	async function streamAudio(
		name: string,
	): Promise<{ stream: ReadableStream<Uint8Array>; mimeType: string }> {
		const filename = safeFilename(name);
		const fullPath = `${SONG_PATH}/${filename}`;
		const f = file(fullPath);

		if (!(await f.exists())) throw new Error(`Local song not found: ${filename}`);

		return {
			stream: f.stream() as ReadableStream<Uint8Array>,
			mimeType: LOCAL_MIME,
		};
	}

	async function validate(): Promise<{ ok: boolean; reason?: string }> {
		try {
			await access(SONG_PATH);
			return { ok: true };
		} catch {
			return { ok: false, reason: `Song directory not accessible: ${SONG_PATH}` };
		}
	}

	return { id: "local-audio", getSong, streamAudio, validate };
}