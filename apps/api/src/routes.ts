import { Elysia } from "elysia";
import { HealthController } from "@/modules/health/health.controller";
import { ScenesController } from "@/modules/scenes/scenes.controller";
import { SongController } from "@/modules/song/song.controller";

export const routes = new Elysia().use([
	HealthController,
	SongController,
	ScenesController,
]);

export type AppRoutes = typeof routes;
