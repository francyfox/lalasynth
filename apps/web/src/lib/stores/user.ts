import type { Session, User } from "better-auth";
import { writable } from "svelte/store";
import { authClient } from "@/lib/auth-client";

function createUserStore() {
	const { update, subscribe, set } = writable<{
		user: User | undefined;
		session: Session | undefined;
	}>({
		user: undefined,
		session: undefined,
	});
	return {
		subscribe,
		getSession: async () => {
			const { data } = await authClient.getSession();
			if (data) {
				update((state) => ({
					...state,
					user: data.user,
					session: data.session,
				}));
			}

			return data;
		},
		logOut: async () => {
			await authClient.signOut();
			set({
				user: undefined,
				session: undefined,
			});
		},
	};
}

export const userStore = createUserStore();
