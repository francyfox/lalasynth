import type { auth } from "@app/master/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";
import { toast } from "svelte-sonner";
import { env } from "@/env";

export const authClient = createAuthClient({
	baseURL: env.VITE_MASTER_URL,
	plugins: [inferAdditionalFields<typeof auth>()],
});

export const fetchOptions: any = {
	onRequest: () => toast.loading("Start authentication..."),
	onResponse: () => toast.dismiss(),
	onSuccess: () => toast.success("Hurray! Dear honey, i glad to see you"),
	onError: (ctx: any) =>
		toast.error(ctx.error.message || "Oh no! Something went wrong"),
} as const;
