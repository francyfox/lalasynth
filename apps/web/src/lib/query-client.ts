import { QueryCache, QueryClient } from "@tanstack/svelte-query";
import { toast } from "svelte-sonner";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(`Error: ${error.message}`);
		},
	}),
});
