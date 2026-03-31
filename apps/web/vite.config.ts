import { resolve } from "node:path";
import routify from "@roxi/routify/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const port = Number(env.PORT) || 4000;
	const apiUrl = env.VITE_API_URL || "http://localhost:3000";
	const masterUrl = env.VITE_MASTER_URL || "http://localhost:5000";

	return {
		plugins: [
			tailwindcss({
				optimize: {
					minify: process.env.NODE_ENV === "production",
				},
			}),
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
			include: ["svelte-sonner", "@roxi/routify", "lucide-svelte"],
		},
		build: {
			outDir: "dist",
		},
		ssr: {
			noExternal: ["@package/ui"],
		},
		server: {
			port,
			strictPort: true,
			proxy: {
				"/song": apiUrl,
				"/static": apiUrl,
				"/api/auth": masterUrl,
			},
		},
	};
});