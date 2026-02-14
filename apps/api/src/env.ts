import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		TURSO_CONNECTION_URL: z.url(),
		TURSO_AUTH_TOKEN: z.string(),
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
