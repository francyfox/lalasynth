// @ts-nocheck — runtime-only file, runs under Bun in Docker

const dist = import.meta.dir + "/dist";

Bun.serve({
	port: 4173,
	hostname: "0.0.0.0",
	async fetch(req) {
		const url = new URL(req.url);
		let pathname = url.pathname === "/" ? "/index.html" : url.pathname;

		const file = Bun.file(`${dist}${pathname}`);
		if (await file.exists()) return new Response(file);

		// SPA fallback
		return new Response(Bun.file(`${dist}/index.html`));
	},
});

console.log("Web server running at http://0.0.0.0:4173");
