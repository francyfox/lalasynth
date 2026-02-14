import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "@/env";
import { betterAuthPlugin } from "@/libs/better-auth";
import { routes } from "@/routes";
import { client } from "./db";

export const app = new Elysia()
	.use(
		cors({
			origin: env.CLIENT_URL,
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.use(betterAuthPlugin)
	.use(routes)
	.listen(3000, (server) => {
		console.log(
			`🦊 Elysia is running at http://${server?.hostname}:${server?.port}`,
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
