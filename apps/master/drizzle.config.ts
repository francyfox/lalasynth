import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./migrations",
	casing: "camelCase",
	dialect: env.TURSO_CONNECTION_URL ? "turso" : "sqlite",
	dbCredentials: {
		url: env.TURSO_CONNECTION_URL ?? "file:data/local.db",
		authToken: env.TURSO_AUTH_TOKEN,
	},
});
