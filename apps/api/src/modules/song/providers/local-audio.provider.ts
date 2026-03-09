import { access, mkdir } from "node:fs/promises";
import { file, Glob } from "bun";
import type { AudioBaseProvider, Song } from "@/modules/song/song.types";

const SONG_PATH = `${process.cwd()}/public/songs`;
const SONG_EXTENSIONS = "webm";
const LOCAL_MIME = 'audio/webm; codecs="opus"';

export async function LocalAudioProvider(): Promise<AudioBaseProvider> {
	try {
		await access(SONG_PATH);
	} catch (_) {
		await mkdir(SONG_PATH, { recursive: true });
	}

	function resolvePath(name: string): string {
		// strip any directory separators so callers can't escape SONG_PATH
		const filename = name.replace(/^.*[\\/]/, "");
		return `${SONG_PATH}/${filename}`;
	}

	async function getSong(name: string): Promise<Song> {
		const fullPath = resolvePath(name);
		const f = file(fullPath);
		if (!(await f.exists())) {
			throw new Error(`Local song not found: ${name}`);
		}
		const baseName = name.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "");
		return {
			videoId: baseName,
			title: baseName,
			audioUrl: `/songs/${name.replace(/^.*[\\/]/, "")}`,
			mimeType: LOCAL_MIME,
			bitrate: 0,
		};
	}

	async function streamAudio(
		name: string,
	): Promise<{ stream: ReadableStream<Uint8Array>; mimeType: string }> {
		const fullPath = resolvePath(name);
		const f = file(fullPath);
		if (!(await f.exists())) {
			throw new Error(`Local song not found: ${name}`);
		}
		return {
			stream: f.stream() as ReadableStream<Uint8Array>,
			mimeType: LOCAL_MIME,
		};
	}

	async function validate(): Promise<{ ok: boolean; reason?: string }> {
		try {
			await access(SONG_PATH);

			const glob = new Glob(`*.${SONG_EXTENSIONS}`);
			let count = 0;
			for await (const _ of glob.scan(SONG_PATH)) {
				count++;
				break;
			}

			if (count === 0) {
				console.warn(`[local-audio] No .${SONG_EXTENSIONS} files in ${SONG_PATH}`);
			}

			return { ok: true };
		} catch {
			return {
				ok: false,
				reason: `Song directory not accessible: ${SONG_PATH}`,
			};
		}
	}

	return {
		id: "local-audio",
		getSong,
		streamAudio,
		validate,
	};
}