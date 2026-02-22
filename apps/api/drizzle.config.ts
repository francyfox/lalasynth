import { defineConfig } from "drizzle-kit";
import { env } from "@/env";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dialect: env.NODE_ENV === "production" ? "turso" : "sqlite",
	dbCredentials: {
		url:
			env.NODE_ENV === "production"
				? env.TURSO_CONNECTION_URL
				: "file:local.db",
		authToken: env.TURSO_AUTH_TOKEN,
	},
});
