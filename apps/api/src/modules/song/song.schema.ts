import { type Static, t } from "elysia";
export const SongSchema = t.Object({
	videoId: t.String(),
	title: t.Optional(t.String()),
	author: t.Optional(t.String()),
	duration: t.Optional(t.Number()),
	audioUrl: t.String(),
	mimeType: t.String(),
	bitrate: t.Number(),
});

export const LyricSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	trackName: t.String(),
	artistName: t.String(),
	albumName: t.String(),
	duration: t.Number(),
	instrumental: t.Boolean(),
	plainLyrics: t.Nullable(t.String()),
	syncedLyrics: t.Nullable(t.String()),
});

export type Song = Static<typeof SongSchema>;
export type Lyric = Static<typeof LyricSchema>;
