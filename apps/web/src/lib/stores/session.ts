import { createQuery } from "@tanstack/svelte-query";
import type { Session, User } from "better-auth";
import { authClient } from "@/lib/auth-client";

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
