import { existsSync } from "node:fs";
import { ConfigHandler, DEFAULT_CLOUDFLARED_BIN, Tunnel, install } from "cloudflared";
import { env } from "@/env";

export async function startCloudflaredTunnel() {
	if (!env.CLOUDFLARED_TOKEN) return;

	if (!existsSync(DEFAULT_CLOUDFLARED_BIN)) {
		console.log("☁️  Cloudflared binary not found, installing...");
		await install(DEFAULT_CLOUDFLARED_BIN);
		console.log("☁️  Cloudflared installed");
	}

	const tunnel = Tunnel.withToken(env.CLOUDFLARED_TOKEN);

	new ConfigHandler(tunnel).once("config", ({ config }) => {
		const rule = (config.ingress ?? []).find(
			(r) => r.hostname && r.service?.includes(String(env.PORT)),
		);
		if (rule) console.log(`☁️  Cloudflared: https://${rule.hostname}`);
	});

	tunnel.on("connected", () => {
		console.log("☁️  Cloudflared tunnel connected");
	});

	tunnel.on("disconnected", () => {
		console.log("☁️  Cloudflared tunnel disconnected");
	});

	tunnel.on("error", (err) => {
		console.error("☁️  Cloudflared tunnel error:", err);
	});

	return tunnel;
}
