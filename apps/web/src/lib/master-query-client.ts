import { QueryCache, QueryClient, focusManager } from "@tanstack/svelte-query";
import { toast } from "svelte-sonner";
import { RateLimitError } from "@/lib/api";

export const masterQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (_, error) => !(error instanceof RateLimitError),
		},
	},
	queryCache: new QueryCache({
		onError: (error) => {
			if (error instanceof RateLimitError) {
				toast.warning(`Rate limit reached. Retrying in ${error.retryAfter}s`);
				focusManager.setFocused(false);
				setTimeout(() => focusManager.setFocused(true), error.retryAfter * 1000);
				return;
			}
			toast.error(`Error: ${error.message}`);
		},
	}),
});
