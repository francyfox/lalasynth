import { join } from "node:path";
import { fileLogger, logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { $ } from "bun";
import { migrate } from "drizzle-orm/libsql/migrator";
import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { env } from "@/env";
import { startCloudflaredTunnel } from "@/libs/cloudflared";
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
	// .use(
	// 	rateLimit({
	// 		max: 20,
	// 		duration: 60000,
	// 		skip: (req) => new URL(req.url).pathname === "/stats",
	// 	}),
	// )
	.use(
		cors({
			origin: [env.CLIENT_URL, "https://lalasynth.shalotts.site"],
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
	.use(routes)
	.listen(env.PORT, async (server) => {
		await migrate(db, {
			migrationsFolder: join(import.meta.dir, "../migrations"),
		});
		if (env.NODE_ENV === "development") {
			await $`bun run schema`;
		}
		console.log(
			`🦊 Elysia is running at http://${server?.hostname}:${server?.port}`,
		);
		console.log(
			`Scalar UI at http://${server?.hostname}:${server?.port}/swagger`,
		);
		await startCloudflaredTunnel();
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
