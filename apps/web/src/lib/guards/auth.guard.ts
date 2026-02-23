import type { RoutifyMeta } from "@roxi/routify";
import { get } from "svelte/store";
import type { GuardFn } from "@/lib/guards/types";
import { userStore } from "@/lib/stores/user";

export const authGuard: GuardFn = async ({ route }) => {
	if ((route as { meta: RoutifyMeta }).meta._auth) {
		const data = get(userStore);

		if (!data.user) {
			const session = await userStore.getSession();

			if (!session) {
				window.location.href = `/auth`;
			}
		}
	}
	return true;
};
