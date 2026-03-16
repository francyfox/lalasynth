import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mutable state shared across tests — mutated per-test in beforeEach.
// ---------------------------------------------------------------------------

const state = {
	songError: null as Error | null,
	lyricsResult: [
		{
			syncedLyrics: "[00:18.11]Never gonna give you up\n[00:20.46]Never gonna let you down",
			plainLyrics: "Never gonna give you up\nNever gonna let you down",
		},
	] as Array<Record<string, string | null>>,
	downloadError: null as Error | null,
	lastApplyLrcMs: null as number | null,
};

const MOCK_SONG = {
	videoId: "dQw4w9WgXcQ",
	title: "Never Gonna Give You Up",
	author: "Rick Astley",
	duration: 213,
};

// ---------------------------------------------------------------------------
// Mock @app/api/providers BEFORE dynamic import of the command under test.
// ---------------------------------------------------------------------------

await mock.module("@app/api/providers", () => ({
	YtdlpProvider: () => ({
		getSong: async (_url: string) => {
			if (state.songError) throw state.songError;
			return MOCK_SONG;
		},
	}),
	LrclibProvider: () => ({
		getLyrics: async (_q: string, _d: number) => state.lyricsResult,
	}),
	downloadToFile: async (_id: string, _dest: string) => {
		if (state.downloadError) throw state.downloadError;
	},
	sanitizeFilename: (n: string) => n,
	applyLrcOffset: (lrc: string, ms: number) => {
		state.lastApplyLrcMs = ms;
		return lrc;
	},
}));

const realFs = await import("node:fs/promises");
await mock.module("node:fs/promises", () => ({
	...realFs,
	writeFile: async () => {},
	mkdir: async () => {},
}));

// ---------------------------------------------------------------------------
// Dynamic import AFTER mocks are installed.
// ---------------------------------------------------------------------------

const { testCommand } = await import("@bunli/test");
const { default: songCommand } = await import("./song");

// ---------------------------------------------------------------------------
// Reset state before each test.
// ---------------------------------------------------------------------------

beforeEach(() => {
	state.songError = null;
	state.lyricsResult = [
		{ syncedLyrics: "[00:18.11]Never gonna give you up\n[00:20.46]Never gonna let you down" },
	];
	state.downloadError = null;
	state.lastApplyLrcMs = null;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("song command", () => {
	test("downloads audio and lyrics successfully", async () => {
		const result = await testCommand(songCommand, {
			flags: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
		});

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("Rick Astley");
		expect(result.stdout).toContain("Rick Astley - Never Gonna Give You Up.webm");
		expect(result.stdout).toContain("Rick Astley - Never Gonna Give You Up.lrc");
	});

	test("prints offset when non-zero", async () => {
		const result = await testCommand(songCommand, {
			flags: {
				url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
				offset: 500,
			},
		});

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("+500ms");
	});

	test("does not print offset line when offset is 0", async () => {
		const result = await testCommand(songCommand, {
			flags: {
				url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
				offset: 0,
			},
		});

		expect(result.exitCode).toBe(0);
		expect(result.stdout).not.toContain("offset");
	});

	test("exits when metadata fetch throws", async () => {
		state.songError = new Error("Video not found");

		const result = await testCommand(songCommand, {
			flags: { url: "https://www.youtube.com/watch?v=invalid" },
		});

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toContain("Video not found");
	});

	test("exits when synced lyrics are null", async () => {
		state.lyricsResult = [{ syncedLyrics: null }];

		const result = await testCommand(songCommand, {
			flags: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
		});

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toContain("synced lyrics");
	});

	test("exits when lyrics array is empty", async () => {
		state.lyricsResult = [];

		const result = await testCommand(songCommand, {
			flags: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
		});

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toContain("synced lyrics");
	});

	test("exits when download fails", async () => {
		state.downloadError = new Error("yt-dlp download failed: exit 1");

		const result = await testCommand(songCommand, {
			flags: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
		});

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toContain("Download failed");
	});

	test("calls applyLrcOffset with correct ms when offset is non-zero", async () => {
		await testCommand(songCommand, {
			flags: {
				url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
				offset: -200,
			},
		});

		expect(state.lastApplyLrcMs).toBe(-200);
	});

	test("does not call applyLrcOffset when offset is 0", async () => {
		await testCommand(songCommand, {
			flags: {
				url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
				offset: 0,
			},
		});

		expect(state.lastApplyLrcMs).toBeNull();
	});
});