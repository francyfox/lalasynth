import { Elysia } from "elysia";
import { ScenesData } from "@/modules/scenes/scenes.data";

export const ScenesController = new Elysia({ name: "Scenes.Controller" }).get(
	"/scenes",
	() => {
		return ScenesData;
	},
);
