import type { paths } from "@app/src/type";
import createClient from "openapi-fetch";
import { env } from "@/env";

export class RateLimitError extends Error {
	retryAfter: number;
	constructor(retryAfter: number) {
		super("Rate limit reached");
		this.retryAfter = retryAfter;
	}
}

export const client = createClient<paths>({
	baseUrl: env.VITE_API_URL,
});

client.use({
	async onResponse({ response }) {
		if (response.status === 429) {
			const retryAfter = Number(response.headers.get("Retry-After") ?? 60);
			throw new RateLimitError(retryAfter);
		}
		return response;
	},
});
