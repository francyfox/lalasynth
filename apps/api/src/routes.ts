import { Elysia } from "elysia";
import { HealthController } from "@/modules/health/health.controller";
import { ScenesController } from "@/modules/scenes/scenes.controller";
import { SongController } from "@/modules/song/song.controller";
import { SoundController } from "@/modules/sound/sound.controller";
import { StatsController } from "@/modules/stats/stats.controller";
export const routes = new Elysia().use([
	new Elysia().get("/", () => Bun.file("./public/ups.png")),
	HealthController,
	SongController,
	SoundController,
	ScenesController,
	StatsController,
]);

export type AppRoutes = typeof routes;
