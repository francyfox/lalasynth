import { spawn } from "bun";
import { Innertube } from "youtubei.js";

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

function ytdlpStream(
	videoId: string,
	browser: string,
): ReadableStream<Uint8Array> {
	const proc = spawn(
		[
			"yt-dlp",
			"--cookies-from-browser", browser,
			"--js-runtimes", "node:/usr/bin/node",
			"--remote-components", "ejs:github",
			"-f", "bestaudio[ext=webm]/bestaudio",
			"--no-playlist",
			"-o", "-",
			`https://www.youtube.com/watch?v=${videoId}`,
		],
		{ stdout: "pipe", stderr: "ignore" },
	);
	return proc.stdout as unknown as ReadableStream<Uint8Array>;
}

export const SongYtService = () => {
	let youtube: Innertube | null = null;

	async function getClient() {
		if (!youtube) {
			youtube = await Innertube.create();
		}
		return youtube;
	}

	function extractVideoId(url: string): string {
		const patterns = [
			/(?:music\.youtube\.com\/watch\?v=|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
			/^([a-zA-Z0-9_-]{11})$/,
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) {
				return match[1];
			}
		}

		throw new Error("Invalid YouTube URL or video ID");
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
			throw new Error("No audio URL available for this video");
		}

		const result: CachedAudio = {
			videoId,
			title: info.basic_info.title,
			author: info.basic_info.author,
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

	return {
		getAudioFromYouTube,
		streamAudio,
	};
};
