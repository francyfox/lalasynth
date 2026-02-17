import { Elysia, t } from "elysia";
import { SongYtService } from "@/modules/song/song-yt.service";

export const SongController = new Elysia({ name: "Song.Controller" }).get(
	"/song",
	async ({ params: { id } }) => {
		return SongYtService().getAudioFromYouTube(id);
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
			videoId: t.String(),
			title: t.Optional(t.String()),
			author: t.Optional(t.String()),
			duration: t.Optional(t.Number()),
			audioUrl: t.String(),
			mimeType: t.String(),
			bitrate: t.Number(),
		}),
	},
);
