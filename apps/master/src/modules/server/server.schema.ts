import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const gameServers = sqliteTable("game_servers", {
	id: text("id")
		.$defaultFn(() => createId())
		.primaryKey(),
	name: text("name").notNull(),
	url: text("url").notNull(),
	version: text("version").notNull(),
	playerCount: integer("player_count").notNull().default(0),
	maxPlayers: integer("max_players").notNull().default(8),
	status: text("status", { enum: ["idle", "playing", "offline"] })
		.notNull()
		.default("idle"),
	registeredAt: integer("registered_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
	lastHeartbeatAt: integer("last_heartbeat_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});

export type GameServer = InferSelectModel<typeof gameServers>;
