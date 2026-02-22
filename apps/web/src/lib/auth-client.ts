import { createAuthClient } from "better-auth/svelte";
// import toast from "svelte-french-toast";
export const authClient = createAuthClient({
	baseURL: "http://localhost:3000",
});

export const fetchOptions = {
	// onRequest: () => toast.loading("Start authentication..."),
	// onResponse: () => toast.dismiss(),
	// onSuccess: () => toast.success("Hurray! Dear honey, i glad to see you"),
	// onError: (ctx) =>
	// 	toast.error(ctx.error.message || "Oh no! Something went wrong"),
};
