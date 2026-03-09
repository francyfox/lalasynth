import { Elysia, t } from "elysia";
import { STREAM_MIME } from "@/modules/song/providers/ytdlp.provider";
import { AUDIO_PROVIDERS, LYRIC_PROVIDERS, songProvider } from "@/modules/song/song.provider";
import { LyricSchema, SongSchema } from "@/modules/song/song.schema";
import type { AudioProvider, Lyric, LyricProvider, Song } from "@/modules/song/song.types";

// Initialized once at startup; validate() runs for each provider
const provider = songProvider();

export const SongController = new Elysia({ name: "Song.Controller" })
	.get(
		"/song/:id",
		async ({ params: { id }, query }) => {
			const { getAudioProvider, getLyricProvider } = await provider;
			const audioId = (query.audioProvider ?? AUDIO_PROVIDERS.ytdlp) as AudioProvider;
			const lyricId = (query.lyricProvider ?? LYRIC_PROVIDERS.lrclib) as LyricProvider;

			const song = (await getAudioProvider(audioId).getSong(id)) as Song;
			if (!song.title) throw new Error("Can't find lyrics without a song title");

			const lyrics = (await getLyricProvider(lyricId).getLyrics(
				song.title,
				song.duration ?? 0,
			)) as Lyric[];

			return {
				song: {
					...song,
					audioUrl: `/song/stream/${song.videoId}`,
					mimeType: STREAM_MIME,
				},
				lyrics,
			};
		},
		{
			detail: {
				description: "Get audio metadata and lyrics by YouTube id/url",
				tags: ["Song"],
			},
			params: t.Object({ id: t.String() }),
			query: t.Object({
				audioProvider: t.Optional(t.String()),
				lyricProvider: t.Optional(t.String()),
			}),
			response: t.Object({
				song: SongSchema,
				lyrics: t.Array(LyricSchema),
			}),
		},
	)
	.get(
		"/song/stream/:id",
		async ({ params: { id }, query }) => {
			const { getAudioProvider } = await provider;
			const audioId = (query.audioProvider ?? AUDIO_PROVIDERS.ytdlp) as AudioProvider;

			const { stream, mimeType } = await getAudioProvider(audioId).streamAudio(id);
			return new Response(stream, {
				headers: { "Content-Type": mimeType },
			});
		},
		{
			detail: {
				description: "Proxy audio stream from the selected provider",
				tags: ["Song"],
			},
			params: t.Object({ id: t.String() }),
			query: t.Object({
				audioProvider: t.Optional(t.String()),
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