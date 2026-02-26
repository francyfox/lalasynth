import { Elysia } from "elysia";
import { HealthController } from "@/modules/health/health.controller";
import { ScenesController } from "@/modules/scenes/scenes.controller";
import { SongController } from "@/modules/song/song.controller";
import { UserController } from "@/modules/user/user.controller";

export const routes = new Elysia().use([
	HealthController,
	SongController,
	ScenesController,
	UserController,
]);

export type AppRoutes = typeof routes;
