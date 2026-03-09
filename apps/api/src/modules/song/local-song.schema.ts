import { InferSelectModel, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { t } from "elysia";

export const LocalSongSchema = sqliteTable("local_song", {
	// filename is the stable identity — matches the file on disk
	filename: text("filename").primaryKey(),
	lrcFilename: text("lrc_filename"),

	title: text("title").notNull(),
	artist: text("artist"),
	// base64 data-URL, e.g. "data:image/jpeg;base64,..."
	albumArt: text("album_art"),

	duration: integer("duration"),
	bitrate: integer("bitrate"),
	mimeType: text("mime_type").notNull(),

	indexedAt: integer("indexed_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});

export type LocalSong = InferSelectModel<typeof LocalSongSchema>;
