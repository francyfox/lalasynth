import { file as bunFile } from "bun";
import { Elysia, t } from "elysia";
import { SONG_PATH } from "@/modules/song/adapters/local-audio.adapter";
import { STREAM_MIME } from "@/modules/song/adapters/ytdlp.adapter";
import { LocalSongBodySchema } from "@/modules/song/local-song.schema";
import { LocalSongService } from "@/modules/song/local-song.service";
import {
	AUDIO_PROVIDERS,
	LYRIC_PROVIDERS,
	songProvider,
} from "@/modules/song/song.provider";
import { findWaveformByFilename } from "@/modules/song/local-song.repository";
import { LyricSchema, SongSchema } from "@/modules/song/song.schema";
import type {
	AudioProvider,
	Lyric,
	LyricProvider,
	Song,
} from "@/modules/song/song.types";

const provider = songProvider();
const service = LocalSongService();

function parseRangeHeader(range: string, total: number): [number, number] {
	const match = range.match(/bytes=(\d*)-(\d*)/);
	if (!match) return [0, total - 1];
	const start = match[1] ? parseInt(match[1]) : total - parseInt(match[2]);
	const end = match[2] ? Math.min(parseInt(match[2]), total - 1) : total - 1;
	return [start, end];
}

const LOCAL_MIME = 'audio/webm; codecs="opus"';

export const SongController = new Elysia({ name: "Song.Controller" })
	.get(
		"/song/local",
		async ({ query }) => {
			return service.searchLocalSongs({
				title: query.title,
				limit: Math.min(query.limit, 100),
				offset: query.offset,
			});
		},
		{
			detail: {
				description:
					"List local songs with optional title filter and pagination",
				tags: ["Song"],
			},
			query: t.Object({
				title: t.Optional(t.String()),
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
			response: t.Object({ song: SongSchema, lyrics: t.Array(LyricSchema) }),
		},
	)
	.get(
		"/song/stream/:id",
		async ({ params: { id }, query, request }) => {
			const isLocalFile = /\.[a-z0-9]+$/i.test(id);

			if (isLocalFile) {
				const f = bunFile(`${SONG_PATH}/${id}`);
				const size = f.size;
				const rangeHeader = request.headers.get("Range");

				if (rangeHeader) {
					const [start, end] = parseRangeHeader(rangeHeader, size);
					return new Response(f.slice(start, end + 1), {
						status: 206,
						headers: {
							"Content-Type": LOCAL_MIME,
							"Content-Range": `bytes ${start}-${end}/${size}`,
							"Content-Length": String(end - start + 1),
							"Accept-Ranges": "bytes",
						},
					});
				}

				return new Response(f, {
					headers: {
						"Content-Type": LOCAL_MIME,
						"Content-Length": String(size),
						"Accept-Ranges": "bytes",
						"Cache-Control": "public, max-age=86400",
					},
				});
			}

			// YouTube: proxy stream (no range support)
			const { getAudioProvider } = await provider;
			const audioId = (query.audioProvider ??
				AUDIO_PROVIDERS.ytdlp) as AudioProvider;
			const { stream, mimeType } =
				await getAudioProvider(audioId).streamAudio(id);
			return new Response(stream, { headers: { "Content-Type": mimeType } });
		},
		{
			detail: {
				description: "Proxy audio stream from the selected provider",
				tags: ["Song"],
			},
			params: t.Object({ id: t.String() }),
			query: t.Object({ audioProvider: t.Optional(t.String()) }),
		},
	)
	.get(
		"/song/lyric/:id",
		async ({ params: { id }, query }) => {
			const { getLyricProvider } = await provider;
			const lyricId = (query.lyricProvider ??
				LYRIC_PROVIDERS.localLyric) as LyricProvider;
			const lyrics = (await getLyricProvider(lyricId).getLyrics(
				id,
				0,
			)) as Lyric[];
			return lyrics;
		},
		{
			detail: {
				description: "Get lyrics for a local song by filename",
				tags: ["Song"],
			},
			params: t.Object({ id: t.String() }),
			query: t.Object({ lyricProvider: t.Optional(t.String()) }),
			response: t.Array(LyricSchema),
		},
	)
	.get(
		"/song/waveform/:filename",
		async ({ params: { filename }, set }) => {
			const row = await findWaveformByFilename(filename);
			if (!row?.waveformBars) {
				set.status = 404;
				return { bars: [] };
			}
			set.headers["cache-control"] = "public, max-age=86400";
			return { bars: JSON.parse(row.waveformBars) as number[] };
		},
		{
			detail: { description: "Get precomputed waveform bars for a local song", tags: ["Song"] },
			params: t.Object({ filename: t.String() }),
			response: t.Object({ bars: t.Array(t.Number()) }),
		},
	)
	.post(
		"/song/save",
		async ({ body }) => {
			const { videoId, title, artist, syncedLyrics, offsetMs } = body;

			const output = await service.saveLocalSong({
				videoId,
				title,
				artist,
				syncedLyrics,
				offsetMs,
			});

			return output;
		},
		{
			detail: {
				description:
					"Download a YouTube song to local collection with synced lyrics",
				tags: ["Song"],
			},
			body: LocalSongBodySchema,
			response: t.Object({
				filename: t.String(),
				lrcFilename: t.String(),
			}),
		},
	);
