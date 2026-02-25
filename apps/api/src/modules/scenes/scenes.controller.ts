import { Elysia, t } from "elysia";
import { ScenesData } from "@/modules/scenes/scenes.data";

export const ScenesController = new Elysia({ name: "Scenes.Controller" }).get(
	"/scenes",
	() => {
		return ScenesData;
	},
	{
		detail: {
			description: "All scenes",
		},
		response: t.Array(
			t.Object({
				id: t.Number(),
				name: t.String(),
				bg: t.String(),
				message: t.Optional(t.String()),
			}),
		),
	},
);
