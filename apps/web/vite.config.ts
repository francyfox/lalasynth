import { createRequire } from "node:module";
import { resolve } from "node:path";
import routify from "@roxi/routify/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import Icons from "unplugin-icons/vite";
import { defineConfig, loadEnv } from "vite";

// @tailwindcss/node resolves packages using enhanced-resolve without explicit mainFields,
// so it picks up daisyui's `"browser": "./daisyui.css"` field and tries to import a .css
// file as an ESM module — which Node.js can't handle. The __tw_resolve hook lets us
// redirect the resolution to the JS entry before enhanced-resolve is even called.
(globalThis as unknown as Record<string, unknown>).__tw_resolve = (
	id: string,
	from: string,
) => {
	if (id === "daisyui") {
		try {
			return createRequire(from).resolve("daisyui/index.js");
		} catch {
			return null;
		}
	}
	return null;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const port = Number(env.PORT) || 4000;
	const apiUrl = env.VITE_API_URL || "http://localhost:3000";
	const masterUrl = env.VITE_MASTER_URL || "http://localhost:5000";

	return {
		plugins: [
			tailwindcss(),
			svelte({
				prebundleSvelteLibraries: false,
			}),
			Icons({
				compiler: "svelte",
				customCollections: {
					local: FileSystemIconLoader("./src/assets/icons"),
				},
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
