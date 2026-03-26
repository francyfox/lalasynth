import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_API_URL: z.string().default(""),
		VITE_MASTER_URL: z.string().default("http://localhost:5000"),
	},
	runtimeEnv: import.meta.env,
});
