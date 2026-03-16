import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { LocalSongSchema, type LocalSong } from "@/modules/song/local-song.schema";

export async function createFtsTable(): Promise<void> {
	await db.run(sql`
		CREATE VIRTUAL TABLE IF NOT EXISTS local_song_fts
		USING fts5(filename UNINDEXED, title, artist, tokenize='unicode61')
	`);
}

export async function rebuildFts(): Promise<void> {
	await db.run(sql`DELETE FROM local_song_fts`);
	await db.run(sql`
		INSERT INTO local_song_fts(filename, title, artist)
		SELECT filename, title, coalesce(artist, '') FROM local_song
	`);
}

export async function upsertSong(song: typeof LocalSongSchema.$inferInsert): Promise<void> {
	await db.insert(LocalSongSchema).values(song).onConflictDoUpdate({
		target: LocalSongSchema.filename,
		set: {
			title: song.title,
			artist: song.artist,
			albumArt: song.albumArt,
			duration: song.duration,
			bitrate: song.bitrate,
			lrcFilename: song.lrcFilename,
		},
	});
}

export async function findSongByFilename(filename: string): Promise<LocalSong | undefined> {
	return db.select().from(LocalSongSchema).where(eq(LocalSongSchema.filename, filename)).get();
}

export async function findSongByTitle(title: string): Promise<LocalSong | undefined> {
	return db.select().from(LocalSongSchema).where(eq(LocalSongSchema.title, title)).get();
}

export async function findExistingArt(
	filename: string,
): Promise<{ albumArt: string | null } | undefined> {
	return db
		.select({ albumArt: LocalSongSchema.albumArt })
		.from(LocalSongSchema)
		.where(eq(LocalSongSchema.filename, filename))
		.get();
}

export async function searchByFts(
	query: string,
	limit: number,
	offset: number,
): Promise<{ rows: LocalSong[]; total: number }> {
	const ftsQuery = `"${query.replace(/"/g, '""')}"*`;

	const [rows, countRows] = await Promise.all([
		db.all<LocalSong>(sql`
			SELECT s.*
			FROM local_song_fts f
			JOIN local_song s ON s.filename = f.filename
			WHERE local_song_fts MATCH ${ftsQuery}
			ORDER BY rank
			LIMIT  ${limit}
			OFFSET ${offset}
		`),
		db.all<{ total: number }>(sql`
			SELECT count(*) AS total
			FROM local_song_fts
			WHERE local_song_fts MATCH ${ftsQuery}
		`),
	]);

	return { rows, total: countRows[0].total };
}

export async function findAllSongs(
	limit: number,
	offset: number,
): Promise<{ rows: LocalSong[]; total: number }> {
	const [rows, countRows] = await Promise.all([
		db.select().from(LocalSongSchema).orderBy(LocalSongSchema.title).limit(limit).offset(offset).all(),
		db.all<{ total: number }>(sql`SELECT count(*) AS total FROM local_song`),
	]);

	return { rows, total: countRows[0].total };
}