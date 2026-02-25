import { Elysia } from "elysia";
import { HealthController } from "@/modules/health/health.controller";
import { SongController } from "@/modules/song/song.controller";

export const routes = new Elysia().use([HealthController, SongController]);

export type AppRoutes = typeof routes;
