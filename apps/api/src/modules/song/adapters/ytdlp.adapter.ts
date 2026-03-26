import { spawn } from "bun";
import { Innertube } from "youtubei.js";
import type { AudioBaseProvider } from "@/modules/song/song.types";

// Cache resolved audio metadata for 5 hours (YouTube URLs expire in ~6h)
const URL_CACHE_TTL_MS = 5 * 60 * 60 * 1000;
type CachedAudio = {
	videoId: string;
	title?: string;
	author?: string;
	duration?: number;
	audioUrl: string;
	mimeType: string;
	bitrate: number;
	expiresAt: number;
};
const audioCache = new Map<string, CachedAudio>();

const BROWSERS = [
	"firefox",
	"chromium",
	"chrome",
	"chromium-browser",
	"brave-browser",
];

const YT_URI_REGEX =
	/(?:music\.youtube\.com\/watch\?v=|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
const YT_ID_REGEX = /^([a-zA-Z0-9_-]{11})$/;
const EXTRACT_ERROR = "Invalid YouTube URL or video ID";
const NOT_FOUND = "No audio URL available for this video";

async function detectBrowser(): Promise<string | null> {
	for (const browser of BROWSERS) {
		const proc = spawn(["which", browser], {
			stdout: "pipe",
			stderr: "ignore",
		});
		const text = await new Response(proc.stdout).text();
		if (text.trim()) return browser;
	}
	return null;
}

// webm/opus — universally supported by MSE in all modern browsers
export const STREAM_MIME = 'audio/webm; codecs="opus"';

// Prefer webm audio-only, fallback to any https-streamable format (no HLS/m3u8 — can't pipe to stdout)
const FORMAT_SELECTOR =
	"bestaudio[ext=webm]/bestaudio[protocol=https]/best[ext=mp4][protocol=https]/bestaudio/best";

export const dlpArgs = (browser: string, videoId: string) => [
	"yt-dlp",
	"--cookies-from-browser",
	browser,
	"--js-runtimes",
	"node:/usr/bin/node",
	"--remote-components",
	"ejs:github",
	"-f",
	FORMAT_SELECTOR,
	"--no-playlist",
	"-o",
	"-",
	`https://www.youtube.com/watch?v=${videoId}`,
];
function ytdlpStream(
	videoId: string,
	browser: string,
): ReadableStream<Uint8Array> {
	const proc = spawn(dlpArgs(browser, videoId), {
		stdout: "pipe",
		stderr: "ignore",
	});
	return proc.stdout as unknown as ReadableStream<Uint8Array>;
}

export const YtdlpProvider = (): AudioBaseProvider => {
	let youtube: Innertube | null = null;

	async function getClient() {
		if (!youtube) {
			youtube = await Innertube.create();
		}
		return youtube;
	}

	function extractVideoId(url: string): string {
		const patterns = [YT_URI_REGEX, YT_ID_REGEX];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) {
				return match[1];
			}
		}

		throw new Error(EXTRACT_ERROR);
	}

	async function getAudioFromYouTube(urlOrId: string): Promise<CachedAudio> {
		const videoId = extractVideoId(urlOrId);

		const cached = audioCache.get(videoId);
		if (cached && cached.expiresAt > Date.now()) {
			return cached;
		}

		const yt = await getClient();

		// IOS client returns formats with direct URLs (WEB/Music clients use SABR streaming)
		const info = await yt.getInfo(videoId, { client: "IOS" });
		const format = info.chooseFormat({ type: "audio", quality: "best" });

		// decipher() transforms the n-parameter even for direct URLs (prevents 403/throttling)
		const audioUrl = await format.decipher(yt.session.player);
		if (!audioUrl) {
			throw new Error(NOT_FOUND);
		}

		const result: CachedAudio = {
			videoId,
			title: info.basic_info.title,
			author: info.basic_info.author?.replace(/\s*-\s*Topic$/i, "").trim(),
			duration: info.basic_info.duration,
			audioUrl,
			mimeType: format.mime_type,
			bitrate: format.bitrate,
			expiresAt: Date.now() + URL_CACHE_TTL_MS,
		};

		audioCache.set(videoId, result);
		return result;
	}

	async function streamAudio(
		urlOrId: string,
	): Promise<{ stream: ReadableStream<Uint8Array>; mimeType: string }> {
		const audio = await getAudioFromYouTube(urlOrId);
		const browser = await detectBrowser();
		if (!browser) {
			throw new Error("No browser found for cookie extraction");
		}
		return {
			stream: ytdlpStream(audio.videoId, browser),
			mimeType: STREAM_MIME,
		};
	}

	async function validate(): Promise<{ ok: boolean; reason?: string }> {
		// 1. Check yt-dlp is installed
		const dlpProc = spawn(["which", "yt-dlp"], {
			stdout: "pipe",
			stderr: "ignore",
		});
		const dlpPath = await new Response(dlpProc.stdout).text();
		if (!dlpPath.trim()) {
			return { ok: false, reason: "yt-dlp not installed" };
		}

		// 2. Check a browser is available for cookie extraction
		const browser = await detectBrowser();
		if (!browser) {
			return {
				ok: false,
				reason: "No browser available for cookie extraction",
			};
		}

		// 3. Check YouTube is reachable (lightweight HEAD — avoids youtubei.js parser noise)
		try {
			const res = await fetch("https://www.youtube.com", { method: "HEAD" });
			if (!res.ok && res.status >= 500) {
				return { ok: false, reason: `YouTube returned HTTP ${res.status}` };
			}
			return { ok: true };
		} catch (err) {
			return {
				ok: false,
				reason: `YouTube unreachable: ${err instanceof Error ? err.message : String(err)}`,
			};
		}
	}

	return {
		id: "ytdlp",
		getSong: getAudioFromYouTube,
		streamAudio,
		validate,
	};
};

const dlpDownloadArgs = (browser: string, videoId: string) => [
	"yt-dlp",
	"--cookies-from-browser",
	browser,
	"--js-runtimes",
	"node:/usr/bin/node",
	"--remote-components",
	"ejs:github",
	"-f",
	FORMAT_SELECTOR,
	"--no-playlist",
	"-o",
	"-",
	`https://www.youtube.com/watch?v=${videoId}`,
];

export async function downloadToFile(
	videoId: string,
	destPath: string,
	bitrateKbps = 128,
): Promise<void> {
	const browser = await detectBrowser();
	if (!browser) throw new Error("No browser found for cookie extraction");

	const dlp = spawn(dlpDownloadArgs(browser, videoId), {
		stdout: "pipe",
		stderr: "ignore",
	});

	const ffmpeg = spawn(
		[
			"ffmpeg",
			"-y",
			"-i",
			"pipe:0",
			"-vn",
			"-c:a",
			"libopus",
			"-b:a",
			`${bitrateKbps}k`,
			"-f",
			"webm",
			destPath,
		],
		{ stdin: "pipe", stdout: "ignore", stderr: "ignore" },
	);

	for await (const chunk of dlp.stdout) {
		ffmpeg.stdin.write(chunk);
	}
	ffmpeg.stdin.end();

	const [dlpExit, ffmpegExit] = await Promise.all([dlp.exited, ffmpeg.exited]);
	if (dlpExit !== 0) throw new Error(`yt-dlp download failed: exit ${dlpExit}`);
	if (ffmpegExit !== 0)
		throw new Error(`ffmpeg transcode failed: exit ${ffmpegExit}`);
}
