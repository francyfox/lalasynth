import type { RoutifyMeta } from "@roxi/routify";
import { get } from "svelte/store";
import { authClient } from "@/lib/auth-client";
import type { GuardFn } from "@/lib/guards/types";
import { queryClient } from "@/lib/query-client";

export const authGuard: GuardFn = async ({ route }) => {
	console.log((route as { meta: RoutifyMeta }).meta);
	if ((route as { meta: RoutifyMeta }).meta._auth) return true;

	let session: { user: unknown } | null = queryClient.getQueryData([
		"session",
	]) as any;

	if (!session) {
		try {
			session = await queryClient.fetchQuery({
				queryKey: ["session"],
				queryFn: async () => {
					const { data } = await authClient.getSession();
					return data;
				},
			});
		} catch (e) {
			session = null;
		}
	}

	if (!session?.user) {
		window.location.href = `/auth`;
		return false;
	}

	return true;
};
