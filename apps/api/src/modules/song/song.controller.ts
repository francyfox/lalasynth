import { Elysia, t } from "elysia";
import { LyricSchema, SongSchema } from "@/modules/song/song.schema";
import { SongLrclibService } from "@/modules/song/song-lrclib.service";
import { SongYtService } from "@/modules/song/song-yt.service";

export const SongController = new Elysia({ name: "Song.Controller" })
	.get(
		"/song/:id",
		async ({ params: { id } }) => {
			const song = await SongYtService().getAudioFromYouTube(id);
			if (!song.title) throw new Error("Can't find lyric without song title");
			const lyrics = await SongLrclibService().getLyrics(
				song.title,
				song.duration || 0,
			);
			return {
				song: { ...song, audioUrl: `/song/stream/${song.videoId}` },
				lyrics,
			};
		},
		{
			detail: {
				description: "Get audio from YouTube by id/url",
				tags: ["Song"],
			},
			params: t.Object({
				id: t.String(),
			}),
			response: t.Object({
				song: SongSchema,
				lyrics: t.Array(LyricSchema),
			}),
		},
	)
	.get(
		"/song/stream/:id",
		async ({ params: { id }, set }) => {
			const stream = await SongYtService().streamAudio(id);
			set.headers["Content-Type"] = "application/octet-stream";

			return stream;
		},
		{
			detail: {
				description: "Proxy audio stream from YouTube with required headers",
				tags: ["Song"],
			},
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.post(
		"/song/lyric/:id",
		async () => {
			return {};
		},
		{
			detail: {
				description: "Select lyric for the song",
				tags: ["Song"],
			},
		},
	);
