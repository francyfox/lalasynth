import { Elysia } from "elysia";
import { HealthController } from "@/modules/health/health.controller";
import { ServerController } from "@/modules/server/server.controller";
import { UserController } from "@/modules/user/user.controller";

export const routes = new Elysia().use([HealthController, UserController, ServerController]);

export type AppRoutes = typeof routes;
