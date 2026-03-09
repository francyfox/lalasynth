import { Elysia, t } from "elysia";
import { STREAM_MIME } from "@/modules/song/providers/ytdlp.provider";
import { searchLocalSongs } from "@/modules/song/local-song.service";
import {
	AUDIO_PROVIDERS,
	LYRIC_PROVIDERS,
	songProvider,
} from "@/modules/song/song.provider";
import { LyricSchema, SongSchema } from "@/modules/song/song.schema";
import type {
	AudioProvider,
	Lyric,
	LyricProvider,
	Song,
} from "@/modules/song/song.types";

// Initialized once at startup; validate() runs for each provider
const provider = songProvider();

export const SongController = new Elysia({ name: "Song.Controller" })
	.get(
		"/song/local",
		async ({ query }) => {
			return searchLocalSongs({
				title: query.title,
				limit: Math.min(query.limit, 100),
				offset: query.offset,
			});
		},
		{
			detail: {
				description: "List local songs with optional title filter and pagination",
				tags: ["Song"],
			},
			query: t.Object({
				title: t.Optional(t.String({ description: "Filter by title (case-insensitive substring)" })),
				limit: t.Number({ default: 20, minimum: 1, maximum: 100 }),
				offset: t.Number({ default: 0, minimum: 0 }),
			}),
			response: t.Object({
				items: t.Array(
					t.Object({
						filename: t.String(),
						title: t.String(),
						artist: t.Nullable(t.String()),
						albumArt: t.Nullable(t.String()),
						duration: t.Nullable(t.Number()),
						lrcFilename: t.Nullable(t.String()),
					}),
				),
				total: t.Number(),
				limit: t.Number(),
				offset: t.Number(),
			}),
		},
	)
	.get(
		"/song/:id",
		async ({ params: { id }, query }) => {
			const { getAudioProvider, getLyricProvider } = await provider;
			const audioId = (query.audioProvider ??
				AUDIO_PROVIDERS.ytdlp) as AudioProvider;
			const lyricId = (query.lyricProvider ??
				LYRIC_PROVIDERS.lrclib) as LyricProvider;

			const song = (await getAudioProvider(audioId).getSong(id)) as Song;
			if (!song.title)
				throw new Error("Can't find lyrics without a song title");

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
			const audioId = (query.audioProvider ??
				AUDIO_PROVIDERS.ytdlp) as AudioProvider;

			const { stream, mimeType } =
				await getAudioProvider(audioId).streamAudio(id);
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
