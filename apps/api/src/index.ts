import { join } from "node:path";
import { fileLogger, logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { $ } from "bun";
import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "@/env";
import { betterAuthPlugin } from "@/libs/better-auth";
import { swaggerDocs } from "@/libs/swagger";
import { routes } from "@/routes";
import { client, db } from "./db";

const logPath = join(import.meta.dir, "../logs/server.log");
export const app = new Elysia()
	.onError(({ code, error, path }) => {
		if (error.hasOwnProperty("message")) return error;
		return {
			message: error,
		};
	})
	.use(
		logger({
			level: "error",
		}),
	)
	.use(
		fileLogger({
			file: logPath,
		}),
	)
	.use(
		rateLimit({
			max: 20,
			duration: 60000,
			skip: (req) => new URL(req.url).pathname === "/stats",
		}),
	)
	.use(
		cors({
			origin: [env.CLIENT_URL],
			methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.use(swagger(swaggerDocs))
	.use(
		staticPlugin({
			prefix: "/static",
		}),
	)
	.use(betterAuthPlugin)
	.use(routes)
	.listen(3000, async (server) => {
		await migrate(db, { migrationsFolder: join(import.meta.dir, "../migrations") });
		if (env.NODE_ENV === "development") {
			await $`bun run schema`;
		}
		console.log(
			`🦊 Elysia is running at http://${server?.hostname}:${server?.port}`,
		);
		console.log(
			`Scalar UI at http://${server?.hostname}:${server?.port}/swagger`,
		);
	});

const stop = async () => {
	console.log("🛑 Shutdown initiated...");
	await app.stop();
	client.close();

	console.log("✨ Gracefully terminated. See you, Fox.");
	process.exit(0);
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
