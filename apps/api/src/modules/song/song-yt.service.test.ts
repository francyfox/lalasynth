import { describe, expect, test } from "bun:test";
import { SongYtService } from "modules/song/song-yt.service";

describe("Song Service", () => {
	test("should extract audio from YouTube URL", async () => {
		const result = await SongYtService().getAudioFromYouTube(
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		);
		console.log(result);

		expect(result.videoId).toBe("dQw4w9WgXcQ");
		expect(result.title).toBeDefined();
		expect(result.audioUrl).toBeDefined();
		expect(result.mimeType).toBeDefined();
	});

	test("should extract audio from youtu.be URL", async () => {
		const result = await SongYtService().getAudioFromYouTube(
			"https://youtu.be/dQw4w9WgXcQ",
		);

		expect(result.videoId).toBe("dQw4w9WgXcQ");
		expect(result.title).toBeDefined();
	});

	test("should extract audio from video ID", async () => {
		const result = await SongYtService().getAudioFromYouTube("dQw4w9WgXcQ");

		expect(result.videoId).toBe("dQw4w9WgXcQ");
		expect(result.title).toBeDefined();
	});

	test("should throw error for invalid URL", async () => {
		expect(async () => {
			await SongYtService().getAudioFromYouTube("invalid-url");
		}).toThrow();
	});
});
