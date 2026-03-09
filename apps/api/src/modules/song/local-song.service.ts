import { findAllSongs, searchByFts } from "@/modules/song/local-song.repository";

export type SearchLocalSongsOptions = {
	title?: string;
	limit: number;
	offset: number;
};

export async function searchLocalSongs(options: SearchLocalSongsOptions) {
	const { title, limit, offset } = options;

	const { rows, total } = title
		? await searchByFts(title, limit, offset)
		: await findAllSongs(limit, offset);

	return { items: rows, total, limit, offset };
}