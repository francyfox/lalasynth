import { resolve } from "node:path";

const result = await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	target: "bun",
	sourcemap: "external",
	minify: false,
	external: [
		// native modules & bun built-ins
		"bun",
		"bun:sqlite",
		// heavy packages better left as-is at runtime
		"@libsql/client",
		"better-auth",
		"drizzle-orm",
		"youtubei.js",
	],
	define: {
		"import.meta.dir": JSON.stringify(resolve("./src")),
	},
});

if (!result.success) {
	for (const message of result.logs) {
		console.error(message);
	}
	process.exit(1);
}

console.log(`✅ Built ${result.outputs.length} file(s) to ./dist`);
