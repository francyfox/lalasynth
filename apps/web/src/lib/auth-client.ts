import { createAuthClient } from "better-auth/svelte";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { toast } from "svelte-sonner";
import type { auth } from "@app/api/auth";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3000",
	plugins: [inferAdditionalFields<typeof auth>()],
});

export const fetchOptions: any = {
	onRequest: () => toast.loading("Start authentication..."),
	onResponse: () => toast.dismiss(),
	onSuccess: () => toast.success("Hurray! Dear honey, i glad to see you"),
	onError: (ctx: any) =>
		toast.error(ctx.error.message || "Oh no! Something went wrong"),
} as const;
