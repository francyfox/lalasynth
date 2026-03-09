import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// NOTE: Bun's built-in "bun" module cannot be replaced with mock.module().
// As a result, detectBrowser() and ytdlpStream() call the real spawn().
// Tests for streamAudio are marked as integration tests or test observable
// error paths that do not depend on spawn being mocked.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FAKE_AUDIO_URL = "https://r1---sn-fake.googlevideo.com/videoplayback?id=test";

/** Build a minimal fake Innertube instance. */
function makeFakeYoutube(overrides: Partial<{ audioUrl: string }> = {}) {
	const audioUrl = overrides.audioUrl ?? FAKE_AUDIO_URL;
	return {
		getInfo: mock(async (_videoId: string, _opts?: unknown) => ({
			basic_info: {
				title: "Rick Astley - Never Gonna Give You Up",
				author: "Rick Astley",
				duration: 213,
			},
			chooseFormat: (_opts: unknown) => ({
				mime_type: "audio/webm; codecs=\"opus\"",
				bitrate: 160000,
				decipher: mock(async (_player: unknown) => audioUrl),
			}),
		})),
		session: { player: {} },
	};
}

// ---------------------------------------------------------------------------
// Mutable state shared with the youtubei.js mock.
// ---------------------------------------------------------------------------

let fakeInnertubeInstance = makeFakeYoutube();

// ---------------------------------------------------------------------------
// Mock youtubei.js BEFORE importing the module under test.
// The provider uses a dynamic import path so mock.module works here.
// Static imports are hoisted; we use dynamic import() below.
// ---------------------------------------------------------------------------

await mock.module("youtubei.js", () => ({
	Innertube: {
		create: mock(async () => fakeInnertubeInstance),
	},
}));

// ---------------------------------------------------------------------------
// Dynamic import AFTER mock installation.
// ---------------------------------------------------------------------------

const { STREAM_MIME, YtdlpProvider, dlpArgs } = await import("./ytdlp.provider");

// ---------------------------------------------------------------------------
// Reset shared state before each test.
// ---------------------------------------------------------------------------

beforeEach(() => {
	fakeInnertubeInstance = makeFakeYoutube();
});

// ---------------------------------------------------------------------------
// STREAM_MIME
// ---------------------------------------------------------------------------

describe("STREAM_MIME", () => {
	test("equals audio/webm opus codec string", () => {
		expect(STREAM_MIME).toBe('audio/webm; codecs="opus"');
	});
});

// ---------------------------------------------------------------------------
// dlpArgs
// ---------------------------------------------------------------------------

describe("dlpArgs", () => {
	test("returns an array", () => {
		expect(Array.isArray(dlpArgs("firefox", "testVideoId1"))).toBe(true);
	});

	test("first element is yt-dlp", () => {
		expect(dlpArgs("firefox", "testVideoId2")[0]).toBe("yt-dlp");
	});

	test("contains browser after --cookies-from-browser flag", () => {
		const browser = "chromium";
		const args = dlpArgs(browser, "testVideoId3");
		const idx = args.indexOf("--cookies-from-browser");
		expect(idx).toBeGreaterThanOrEqual(0);
		expect(args[idx + 1]).toBe(browser);
	});

	test("contains full YouTube URL with the given videoId", () => {
		const videoId = "abcdefghijk";
		const args = dlpArgs("firefox", videoId);
		expect(args).toContain(`https://www.youtube.com/watch?v=${videoId}`);
	});

	test("contains -f bestaudio format selector", () => {
		const args = dlpArgs("firefox", "testVideoId4");
		const idx = args.indexOf("-f");
		expect(idx).toBeGreaterThanOrEqual(0);
		expect(args[idx + 1]).toMatch(/bestaudio/);
	});

	test("outputs to stdout via -o -", () => {
		const args = dlpArgs("firefox", "testVideoId5");
		const idx = args.indexOf("-o");
		expect(idx).toBeGreaterThanOrEqual(0);
		expect(args[idx + 1]).toBe("-");
	});

	test("contains --no-playlist flag", () => {
		expect(dlpArgs("firefox", "testVideoId6")).toContain("--no-playlist");
	});

	test("browser appears exactly once at expected position", () => {
		const browser = "brave-browser";
		const args = dlpArgs(browser, "testVideoId7");
		const occurrences = args.filter((a) => a === browser).length;
		expect(occurrences).toBe(1);
	});
});

// ---------------------------------------------------------------------------
// YtdlpProvider factory
// ---------------------------------------------------------------------------

describe("YtdlpProvider", () => {
	test("id equals 'ytdlp'", () => {
		expect(YtdlpProvider().id).toBe("ytdlp");
	});

	test("getSong is a function", () => {
		expect(typeof YtdlpProvider().getSong).toBe("function");
	});

	test("streamAudio is a function", () => {
		expect(typeof YtdlpProvider().streamAudio).toBe("function");
	});
});

// ---------------------------------------------------------------------------
// getSong — URL and ID extraction
// Use unique video IDs per test to avoid module-level audioCache collisions.
// The IDs are intentionally longer than 11 chars so they don't match
// YT_ID_REGEX and must go through YT_URI_REGEX (URL-based extraction).
// ---------------------------------------------------------------------------

describe("getSong — URL extraction", () => {
	test("extracts video ID from youtube.com/watch?v=", async () => {
		const videoId = "ytUT_001_aaaa";
		const result = (await YtdlpProvider().getSong(
			`https://www.youtube.com/watch?v=${videoId}`,
		)) as { videoId: string; audioUrl: string };
		expect(result.videoId).toBe(videoId);
		expect(result.audioUrl).toBe(FAKE_AUDIO_URL);
	});

	test("extracts video ID from youtu.be/ID", async () => {
		const videoId = "ytYB_001_aaaa";
		const result = (await YtdlpProvider().getSong(
			`https://youtu.be/${videoId}`,
		)) as { videoId: string };
		expect(result.videoId).toBe(videoId);
	});

	test("extracts video ID from music.youtube.com/watch?v=", async () => {
		const videoId = "ytMU_001_aaaa";
		const result = (await YtdlpProvider().getSong(
			`https://music.youtube.com/watch?v=${videoId}`,
		)) as { videoId: string };
		expect(result.videoId).toBe(videoId);
	});

	test("accepts bare 11-character video ID", async () => {
		// YT_ID_REGEX: exactly 11 alphanumeric / _ / - chars
		const videoId = "abcdefghijk";
		const result = (await YtdlpProvider().getSong(videoId)) as { videoId: string };
		expect(result.videoId).toBe(videoId);
	});

	test("throws for a random HTTP URL", () => {
		expect(
			YtdlpProvider().getSong("https://example.com/not-a-video"),
		).rejects.toThrow("Invalid YouTube URL or video ID");
	});

	test("throws for a short string (< 11 chars)", () => {
		expect(YtdlpProvider().getSong("bad")).rejects.toThrow(
			"Invalid YouTube URL or video ID",
		);
	});

	test("throws for an empty string", () => {
		expect(YtdlpProvider().getSong("")).rejects.toThrow(
			"Invalid YouTube URL or video ID",
		);
	});

	test("throws for a 12-char string that looks like an ID but is too long", () => {
		expect(YtdlpProvider().getSong("abcdefghijkl")).rejects.toThrow(
			"Invalid YouTube URL or video ID",
		);
	});
});

// ---------------------------------------------------------------------------
// getSong — returned data shape
// ---------------------------------------------------------------------------

describe("getSong — returned data shape", () => {
	test("returns all expected fields with correct types", async () => {
		const videoId = "ytSH_001_aaaa";
		const result = (await YtdlpProvider().getSong(
			`https://www.youtube.com/watch?v=${videoId}`,
		)) as {
			videoId: string;
			title: string;
			author: string;
			duration: number;
			audioUrl: string;
			mimeType: string;
			bitrate: number;
			expiresAt: number;
		};
		expect(result.videoId).toBe(videoId);
		expect(result.title).toBeTruthy();
		expect(result.author).toBeTruthy();
		expect(result.duration).toBeGreaterThan(0);
		expect(result.audioUrl).toStartWith("http");
		expect(result.mimeType).toBeTruthy();
		expect(result.bitrate).toBeGreaterThan(0);
		expect(result.expiresAt).toBeGreaterThan(Date.now());
	});
});

// ---------------------------------------------------------------------------
// getSong — caching
// ---------------------------------------------------------------------------

describe("getSong — caching", () => {
	test("second call with same ID returns cached result (getInfo called once)", async () => {
		fakeInnertubeInstance = makeFakeYoutube();
		const videoId = "ytCA_001_aaaa";
		const provider = YtdlpProvider();

		await provider.getSong(`https://www.youtube.com/watch?v=${videoId}`);
		await provider.getSong(`https://www.youtube.com/watch?v=${videoId}`);

		// getInfo should be called only once — second call hits the module-level cache.
		expect(fakeInnertubeInstance.getInfo).toHaveBeenCalledTimes(1);
	});

	test("different video IDs are cached independently", async () => {
		fakeInnertubeInstance = makeFakeYoutube();
		const provider = YtdlpProvider();

		const r1 = (await provider.getSong(
			"https://www.youtube.com/watch?v=ytCA_002_aaaa",
		)) as { videoId: string };
		const r2 = (await provider.getSong(
			"https://www.youtube.com/watch?v=ytCA_003_aaaa",
		)) as { videoId: string };

		expect(r1.videoId).toBe("ytCA_002_aaaa");
		expect(r2.videoId).toBe("ytCA_003_aaaa");
	});

	test("URL variants for same video ID share one cache entry", async () => {
		fakeInnertubeInstance = makeFakeYoutube();
		const videoId = "ytCA_004_aaaa";
		const provider = YtdlpProvider();

		await provider.getSong(`https://www.youtube.com/watch?v=${videoId}`);
		await provider.getSong(`https://youtu.be/${videoId}`);

		expect(fakeInnertubeInstance.getInfo).toHaveBeenCalledTimes(1);
	});
});

// ---------------------------------------------------------------------------
// streamAudio
// ---------------------------------------------------------------------------

describe("streamAudio", () => {
	// NOTE: streamAudio internally calls detectBrowser() which uses the real
	// bun spawn() — Bun built-ins cannot be replaced by mock.module().
	// The "no browser" path is only reachable on machines with no browser
	// installed, so we test the error path for invalid input instead.

	test("throws 'Invalid YouTube URL' for bad URL before any I/O", () => {
		// This throws synchronously inside extractVideoId — no spawn/network needed.
		expect(
			YtdlpProvider().streamAudio("not-a-valid-url-or-id-x"),
		).rejects.toThrow("Invalid YouTube URL or video ID");
	});

	test("throws 'Invalid YouTube URL' for empty string", () => {
		expect(YtdlpProvider().streamAudio("")).rejects.toThrow(
			"Invalid YouTube URL or video ID",
		);
	});

	// integration — requires real network and installed yt-dlp + browser cookie
	test.skip("returns { stream, mimeType: STREAM_MIME } with valid video ID", async () => {
		// integration
		const result = await YtdlpProvider().streamAudio("dQw4w9WgXcQ");
		expect(result.mimeType).toBe(STREAM_MIME);
		expect(result.stream).toBeInstanceOf(ReadableStream);
	}, 60_000);
});