import { describe, expect, test } from "bun:test";
import { SongYtService } from "modules/song/song-yt.service";

describe("Song Service", () => {
	test("should extract audio from YouTube URL", async () => {
		const result = await SongYtService().getAudioFromYouTube(
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		);

		expect(result.videoId).toBe("dQw4w9WgXcQ");
		expect(result.title).toBeTruthy();
		expect(result.audioUrl).toBeTruthy();
		expect(result.audioUrl).toStartWith("http");
		expect(result.mimeType).toBeTruthy();
		expect(result.bitrate).toBeGreaterThan(0);
	});

	test("should extract audio from youtu.be URL", async () => {
		const result = await SongYtService().getAudioFromYouTube(
			"https://youtu.be/dQw4w9WgXcQ",
		);

		expect(result.videoId).toBe("dQw4w9WgXcQ");
		expect(result.title).toBeTruthy();
		expect(result.audioUrl).toBeTruthy();
		expect(result.audioUrl).toStartWith("http");
	});

	test("should extract audio from video ID", async () => {
		const result = await SongYtService().getAudioFromYouTube("dQw4w9WgXcQ");

		expect(result.videoId).toBe("dQw4w9WgXcQ");
		expect(result.title).toBeTruthy();
		expect(result.audioUrl).toBeTruthy();
		expect(result.audioUrl).toStartWith("http");
	});

	test("should throw error for invalid URL", async () => {
		expect(
			async () =>
				await SongYtService().getAudioFromYouTube(
					"https://example.com/not-a-video",
				),
		).toThrow("Invalid YouTube URL or video ID");
	});

	test("audioUrl is fetchable (not 403)", async () => {
		const info = await SongYtService().getAudioFromYouTube("dQw4w9WgXcQ");
		console.log("audioUrl:", info.audioUrl.substring(0, 120));
		const res = await fetch(info.audioUrl, {
			headers: { Range: "bytes=0-1000" },
		});
		console.log("status:", res.status, "content-type:", res.headers.get("content-type"));
		expect(res.status).toBeLessThan(400);
	}, 30_000);

	test("streamAudio (direct URL) returns readable bytes", async () => {
		const { stream, mimeType } = await SongYtService().streamAudio("dQw4w9WgXcQ");
		console.log("mimeType:", mimeType);
		const reader = stream.getReader();
		let total = 0;
		for (let i = 0; i < 3; i++) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value?.length ?? 0;
		}
		reader.cancel();
		console.log("bytes received:", total);
		expect(total).toBeGreaterThan(0);
	}, 60_000);

	test("streamAudio (geo-restricted, yt-dlp fallback) returns readable bytes", async () => {
		const { stream, mimeType } = await SongYtService().streamAudio("ZLYP7eju_DE");
		console.log("mimeType:", mimeType);
		const reader = stream.getReader();
		let total = 0;
		for (let i = 0; i < 5; i++) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value?.length ?? 0;
		}
		reader.cancel();
		console.log("bytes received:", total);
		expect(total).toBeGreaterThan(0);
	}, 60_000);
});