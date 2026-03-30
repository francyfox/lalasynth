import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		PORT: z.coerce.number().default(3000),
		LOCAL_SONGS_AUDIO_BITRATE_KBPS: z.coerce
			.number()
			.int()
			.min(48)
			.max(320)
			.default(128),
		CLIENT_URL: z.url(),
		TURSO_CONNECTION_URL: z.url().optional(),
		TURSO_AUTH_TOKEN: z.string().optional(),
		TURSO_API_TOKEN: z.string().optional(),
		TURSO_ORG_NAME: z.string().optional(),
		TURSO_DB_NAME: z.string().optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
