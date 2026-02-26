import { createMutation, createQuery } from "@tanstack/svelte-query";
import { toast } from "svelte-sonner";
import { client } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";

type SessionData = typeof authClient.$Infer.Session | null;

export function getSessionStore() {
	return createQuery<SessionData>(() => ({
		queryKey: ["session"],
		queryFn: async () => {
			const { data } = await authClient.getSession();
			if (!data) return null;
			return data;
		},
		staleTime: (query) => {
			const expiresAt = query.state.data?.session?.expiresAt;
			if (!expiresAt) return 0;
			return Math.max(0, new Date(expiresAt).getTime() - Date.now());
		},
	}));
}

export const getSessionMutations = () => {
	const updateLevelMutation = createMutation(() => ({
		mutationFn: async (level: number) => {
			const session = queryClient.getQueryData<SessionData>(["session"]);
			const id = session?.user?.id;

			if (!id) throw new Error("Unknown session");

			const { data, error } = await client.PATCH("/user/{id}", {
				params: {
					path: {
						id,
					},
				},
				body: {
					level,
				},
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (error) toast.error(String(error));

			return data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session"] }),
	}));

	return {
		updateLevel: (level: number) => updateLevelMutation.mutate(level),
	};
};
