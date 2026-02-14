import { Elysia } from "elysia";
import { UserController } from "@/modules/user/user.controller";

export const routes = new Elysia({ name: "App.Routes" }).use(UserController);
