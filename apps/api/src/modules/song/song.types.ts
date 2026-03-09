import type { Static } from "elysia";
import type { LyricSchema, SongSchema } from "@/modules/song/song.schema";

export type Song = Static<typeof SongSchema>;
export type Lyric = Static<typeof LyricSchema>;

export const AUDIO_PROVIDERS = {
	ytdlp: "ytdlp",
	localAudio: "local-audio",
} as const;

export const LYRIC_PROVIDERS = {
	lrclib: "lrclib",
} as const;

type ValueOf<T> = T[keyof T];
export type AudioProvider = ValueOf<typeof AUDIO_PROVIDERS>;
export type LyricProvider = ValueOf<typeof LYRIC_PROVIDERS>;

export interface AudioBaseProvider {
	readonly id: string;
	getSong(url: string): Promise<Song | unknown>;
	streamAudio(
		url: string,
	): Promise<{ stream: ReadableStream<Uint8Array>; mimeType: string }>;
	validate(): Promise<{ ok: boolean; reason?: string }>;
}

export interface LyricBaseProvider {
	readonly id: string;
	getLyrics(search: string, duration: number): Promise<Lyric | unknown>;
	validate(): Promise<{ ok: boolean; reason?: string }>;
}
