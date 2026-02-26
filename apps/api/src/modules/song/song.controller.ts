import { Elysia, t } from "elysia";
import { SongSchema } from "@/modules/song/song.schema";
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
		response: SongSchema,
	},
);
