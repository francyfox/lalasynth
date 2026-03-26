import type { paths } from "@app/master";
import createClient from "openapi-fetch";
import { env } from "@/env";
import { RateLimitError } from "@/lib/api";

export const masterClient = createClient<paths>({
	baseUrl: env.VITE_MASTER_URL,
});

masterClient.use({
	async onResponse({ response }) {
		if (response.status === 429) {
			const retryAfter = Number(response.headers.get("Retry-After") ?? 60);
			throw new RateLimitError(retryAfter);
		}
		return response;
	},
});
