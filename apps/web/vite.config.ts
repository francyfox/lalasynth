import { resolve } from "node:path";
import routify from "@roxi/routify/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		svelte({
			prebundleSvelteLibraries: false,
		}),
		routify(),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@app": resolve(__dirname, "../api"),
			"@package/ui": resolve(__dirname, "../../packages/ui/src"),
		},
	},
	optimizeDeps: {
		exclude: ["@package/ui"],
	},
	ssr: {
		noExternal: ["@package/ui"],
	},
	server: {
		port: 4000,
		strictPort: true,
	},
});
