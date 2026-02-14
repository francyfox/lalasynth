import { Elysia } from "elysia";
import { HealthController } from "@/modules/health/health.controller";
import { UserController } from "@/modules/user/user.controller";

export const routes = new Elysia({ name: "App.Routes" })
	.use(HealthController)
	.use(UserController);
