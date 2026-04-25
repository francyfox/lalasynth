import { join } from "node:path";
import { fileLogger, logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { migrate } from "drizzle-orm/libsql/migrator";
import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { env } from "@/env";
import { betterAuthPlugin } from "@/libs/better-auth";
import { swaggerDocs } from "@/libs/swagger";
import { routes } from "@/routes";
import { client, db } from "./db";

const logPath = join(import.meta.dir, "../logs/server.log");

await migrate(db, {
	migrationsFolder: join(import.meta.dir, "../migrations"),
});

export const app = new Elysia()
	.onError(({ error }) => {
		if (error.hasOwnProperty("message")) return error;
		return { message: error };
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
			max: 60,
			duration: 60000,
			skip: (req) => new URL(req.url).pathname === "/health",
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
	.use(betterAuthPlugin)
	.use(routes)
	.listen(env.PORT, (server) => {
		console.log(
			`🎮 Master server running at http://${server?.hostname}:${server?.port}`,
		);
		console.log(
			`Scalar UI at http://${server?.hostname}:${server?.port}/swagger`,
		);
	});

const stop = async () => {
	console.log("🛑 Shutdown initiated...");
	await app.stop();
	client.close();
	console.log("✨ Gracefully terminated.");
	process.exit(0);
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
