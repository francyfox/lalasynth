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

});