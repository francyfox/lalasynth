import { Elysia } from "elysia";
import { HealthController } from "@/modules/health/health.controller";
import { UserController } from "@/modules/user/user.controller";

export const routes = new Elysia().use([HealthController, UserController]);

export type AppRoutes = typeof routes;
