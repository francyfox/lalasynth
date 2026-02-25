import type { RoutifyMeta } from "@roxi/routify";
import { authClient } from "@/lib/auth-client";
import type { GuardFn } from "@/lib/guards/types";
import { queryClient } from "@/lib/query-client";
export const authGuard: GuardFn = async ({ route }) => {
	const isAuth = (route as any).url === "/auth";
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

	if (!session?.user && !isAuth) {
		window.location.href = `/auth`;
		return false;
	}

	return true;
};
