import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		CLIENT_URL: z.url(),
		TURSO_CONNECTION_URL: z.url(),
		TURSO_AUTH_TOKEN: z.string(),
		BETTER_AUTH_BASE_URL: z.string(),
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),

		TURSO_API_TOKEN: z.string(), // Platform API Token (turso auth token)
		TURSO_ORG_NAME: z.string(), // Имя организации (обычно ник на GitHub)
		TURSO_DB_NAME: z.string(), // Имя базы данных
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
