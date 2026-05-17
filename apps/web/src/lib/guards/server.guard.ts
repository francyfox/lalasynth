import type { RoutifyMeta } from "@roxi/routify";
import { activeServer } from "@/lib/stores/active-server.svelte";
import type { GuardFn } from "@/lib/guards/types";

export const serverGuard: GuardFn = ({ route }) => {
	const meta = (route as { meta: RoutifyMeta & { _server?: boolean } }).meta;
	if (!meta._server) return true;

	if (!activeServer.current) {
		window.location.href = "/servers";
		return false;
	}

	return true;
};
