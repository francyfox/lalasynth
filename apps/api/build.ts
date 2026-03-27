import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const PLATFORMS = {
	linux: { target: "bun-linux-x64", suffix: "-linux-x64" },
	"linux-arm64": { target: "bun-linux-arm64", suffix: "-linux-arm64" },
	windows: { target: "bun-windows-x64", suffix: "-windows-x64.exe" },
	macos: { target: "bun-darwin-arm64", suffix: "-macos-arm64" },
	"macos-x64": { target: "bun-darwin-x64", suffix: "-macos-x64" },
} as const;

type Platform = keyof typeof PLATFORMS;

const args = process.argv.slice(2);
const binIndex = args.indexOf("--bin");
const isBin = binIndex !== -1;
const binTarget = isBin ? (args[binIndex + 1] as Platform | undefined) : undefined;

if (isBin) {
	if (!binTarget || !(binTarget in PLATFORMS)) {
		console.error("Usage: bun run build.ts --bin <platform>");
		console.error(`Platforms: ${Object.keys(PLATFORMS).join(", ")}`);
		process.exit(1);
	}

	const { target, suffix } = PLATFORMS[binTarget];
	const outfile = `dist/bin/api${suffix}`;

	mkdirSync("dist/bin", { recursive: true });

	console.log(`Building binary for ${binTarget} (${target})...`);

	const result = await Bun.build({
		entrypoints: ["./src/index.ts"],
		compile: { target, outfile },
		minify: true,
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

	console.log(`✅ Binary built → ${outfile}`);
} else {
	const result = await Bun.build({
		entrypoints: ["./src/index.ts"],
		outdir: "./dist",
		target: "bun",
		sourcemap: "external",
		minify: false,
		external: [
			"bun",
			"bun:sqlite",
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
}