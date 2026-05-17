import { existsSync } from "node:fs";
import { DEFAULT_CLOUDFLARED_BIN, Tunnel, install } from "cloudflared";
import { env } from "@/env";

async function ensureBinary() {
	if (!existsSync(DEFAULT_CLOUDFLARED_BIN)) {
		console.log("☁️  Cloudflared binary not found, installing...");
		await install(DEFAULT_CLOUDFLARED_BIN);
		console.log("☁️  Cloudflared installed");
	}
}

export async function startCloudflaredTunnel(): Promise<string | null> {
	if (!env.MASTER_URL && !env.CLOUDFLARED_TOKEN) return null;

	await ensureBinary();

	return env.CLOUDFLARED_TOKEN
		? startNamedTunnel(env.CLOUDFLARED_TOKEN)
		: startQuickTunnel();
}

function startNamedTunnel(token: string): Promise<string | null> {
	return new Promise((resolve) => {
		const tunnel = Tunnel.withToken(token);

		tunnel.on("connected", () => {
			console.log(`☁️  Cloudflared connected: ${env.API_URL}`);
			resolve(env.API_URL);
		});

		tunnel.on("disconnected", () => console.log("☁️  Cloudflared disconnected"));
		tunnel.on("error", (err) => {
			console.error("☁️  Cloudflared error:", err);
			resolve(env.API_URL);
		});
	});
}

function startQuickTunnel(): Promise<string | null> {
	return new Promise((resolve) => {
		const tunnel = Tunnel.quick(`http://localhost:${env.PORT}`);

		tunnel.on("url", (url) => {
			console.log(`☁️  Cloudflared quick tunnel: ${url}`);
			resolve(url);
		});

		tunnel.on("disconnected", () => console.log("☁️  Cloudflared disconnected"));
		tunnel.on("error", (err) => {
			console.error("☁️  Cloudflared error:", err);
			resolve(null);
		});

		setTimeout(() => {
			console.warn("☁️  Cloudflared URL timeout, using API_URL");
			resolve(env.API_URL);
		}, 30_000);
	});
}
