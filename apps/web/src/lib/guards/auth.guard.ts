import type { RoutifyMeta } from "@roxi/routify";
import { authClient } from "@/lib/auth-client";
import type { GuardFn } from "@/lib/guards/types";
import { queryClient } from "@/lib/query-client";
import { activeServer } from "@/lib/stores/active-server.svelte";

export const authGuard: GuardFn = async ({ route }) => {
	if (!(route as { meta: RoutifyMeta }).meta._auth) return true;

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
		window.location.href = "/auth";
		return false;
	}

	if (!activeServer.current && window.location.pathname !== "/servers") {
		window.location.href = "/servers";
		return false;
	}

	return true;
};
