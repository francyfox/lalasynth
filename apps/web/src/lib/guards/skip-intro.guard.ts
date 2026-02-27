import type { RoutifyMeta } from "@roxi/routify";
import { authClient } from "@/lib/auth-client";
import type { GuardFn } from "@/lib/guards/types";
import { queryClient } from "@/lib/query-client";

export const skipIntroGuard: GuardFn = async ({ route }) => {
	const meta = (route as { meta: RoutifyMeta }).meta;
	if (meta._auth || meta._skip) return true;

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
		} catch {
			session = null;
		}
	}

	if (session?.user) {
		window.location.href = `/lobby`;
		return false;
	}

	return true;
};
