CREATE TABLE `game_servers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`version` text NOT NULL,
	`player_count` integer DEFAULT 0 NOT NULL,
	`max_players` integer DEFAULT 8 NOT NULL,
	`status` text DEFAULT 'idle' NOT NULL,
	`registered_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`last_heartbeat_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
