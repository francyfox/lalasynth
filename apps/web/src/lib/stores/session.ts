import {
	createMutation,
	createQuery,
	useQueryClient,
} from "@tanstack/svelte-query";
import type { Session, User } from "better-auth";
import { client } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";

type SessionData = {
	user: User;
	session: Session;
} | null;

export function getSessionStore() {
	return createQuery<SessionData>(() => ({
		queryKey: ["session"],
		queryFn: async () => {
			const { data } = await authClient.getSession();
			if (!data) return null;
			return {
				user: data.user as User,
				session: data.session as Session,
			};
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
		mutationFn: (level: number) => {
			const session = queryClient.getQueryData<SessionData>(["session"]);
			const id = session?.user?.id;

			if (!id) throw new Error("Unknown session");

			return client.PATCH("/user/{id}", {
				params: {
					path: {
						id,
					},
				},
				body: {
					level,
				},
			});
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session"] }),
	}));

	return {
		updateLevel: (level: number) => updateLevelMutation.mutate(level),
	};
};
