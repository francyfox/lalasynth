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

export type Song = Static<typeof SongSchema>;
