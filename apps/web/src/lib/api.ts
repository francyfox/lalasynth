import type { paths } from "@app/src/type";
import createClient from "openapi-fetch";
import { env } from "@/env";
import { activeServer } from "@/lib/stores/active-server.svelte";

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
	async onRequest({ request }) {
		const base = activeServer.current?.url ?? env.VITE_API_URL;
		if (base) {
			const original = new URL(request.url);
			const newUrl = new URL(original.pathname + original.search, base);
			return new Request(newUrl, request);
		}
		return request;
	},
	async onResponse({ response }) {
		if (response.status === 429) {
			const retryAfter = Number(response.headers.get("Retry-After") ?? 60);
			throw new RateLimitError(retryAfter);
		}
		return response;
	},
});
