import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
export default {
	// Consult https://svelte.dev/docs#compile-time-svelte-preprocess
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	onwarn: (warning, handler) => {
		if (warning.code === "slot_element_deprecated") return;
		handler(warning);
	},
	compilerOptions: {
		cssHash: ({ hash, css }) => `s-${hash(css)}`,
		compatibility: {
			componentApi: 4,
		},
	},
};
