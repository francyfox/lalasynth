import type { Server } from "bun";
import { Elysia, t } from "elysia";
import { ServerService } from "./server.service";

const WS_TOPIC = "servers";

const service = ServerService();

setInterval(async () => {
	await service.cleanup();
}, 60_000);

const RegisterBody = t.Object({
	name: t.String(),
	url: t.String(),
	version: t.String(),
	maxPlayers: t.Number({ default: 8 }),
});

const HeartbeatBody = t.Object({
	playerCount: t.Number({ minimum: 0 }),
	status: t.Union([t.Literal("idle"), t.Literal("playing")]),
});

async function broadcastServers(server: Server<unknown> | null) {
	const servers = await service.getActive();
	server?.publish(WS_TOPIC, JSON.stringify({ type: "servers", data: servers }));
}

export const ServerController = new Elysia({ name: "Server.Controller" })
	.get(
		"/servers",
		async () => service.getActive(),
		{ detail: { tags: ["Server"] } },
	)
	.post(
		"/servers/register",
		async ({ body, server }) => {
			const id = await service.register(body);
			await broadcastServers(server);
			return { id };
		},
		{
			body: RegisterBody,
			detail: { tags: ["Server"] },
		},
	)
	.post(
		"/servers/:id/heartbeat",
		async ({ params, body, server, set }) => {
			const ok = await service.heartbeat(params.id, body);
			if (!ok) {
				set.status = 404;
				return { message: "Server not found" };
			}
			await broadcastServers(server);
			return { ok: true };
		},
		{
			body: HeartbeatBody,
			detail: { tags: ["Server"] },
		},
	)
	.delete(
		"/servers/:id",
		async ({ params, server }) => {
			await service.unregister(params.id);
			await broadcastServers(server);
			return { ok: true };
		},
		{ detail: { tags: ["Server"] } },
	)
	.ws("/servers/ws", {
		async open(ws) {
			ws.subscribe(WS_TOPIC);
			const servers = await service.getActive();
			ws.send(JSON.stringify({ type: "servers", data: servers }));
		},
	});
