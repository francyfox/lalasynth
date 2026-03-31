import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		PORT: z.coerce.number().default(5000),
		CLIENT_URL: z.url(),
		TURSO_CONNECTION_URL: z.url().optional(),
		TURSO_AUTH_TOKEN: z.string().optional(),
		BETTER_AUTH_BASE_URL: z.string(),
		BETTER_AUTH_SECRET: z.string().optional(),
		GITHUB_CLIENT_ID: z.string().optional(),
		GITHUB_CLIENT_SECRET: z.string().optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
