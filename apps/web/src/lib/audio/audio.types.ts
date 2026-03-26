import type { Lyric, Song } from "@app/src/modules/song/song.types";

export type PlayerState = "idle" | "loading" | "ready" | "error";

export interface AudioProviders {
	audioProvider?: string;
	lyricProvider?: string;
}

export interface IAudioChannel {
	stop(): void;
}

export interface ISongPlayer extends IAudioChannel {
	readonly audioEl: HTMLAudioElement;
	readonly song: Song | null;
	readonly lyrics: Lyric[];
	readonly status: PlayerState;
	readonly analyserNode: AnalyserNode;
	readonly currentTime: number;
	readonly duration: number;
	readonly paused: boolean;
	load(id: string, providers?: AudioProviders): Promise<void>;
	play(): Promise<void>;
	pause(): void;
	resume(): Promise<void>;
	stop(): void;
	seekTo(seconds: number): void;
	setNoiseLevel(level: number): void;
}

export interface IBgAudioPlayer extends IAudioChannel {
	readonly current: string | null;
	readonly playing: boolean;
	readonly pending: string | null;
	play(name: string, loop?: boolean): Promise<void>;
	resume(): Promise<void>;
	stop(): void;
}

export interface IAudioManager {
	// Song state
	readonly audioEl: HTMLAudioElement | null;
	readonly songCurrentTime: number;
	readonly songDuration: number;
	readonly analyserNode: AnalyserNode | null;
	readonly songData: Song | null;
	readonly lyrics: Lyric[];
	readonly songStatus: PlayerState;
	// Bg state
	readonly bgPlaying: boolean;
	// Actions
	playBg(name: string): Promise<void>;
	resumeBg(): Promise<void>;
	loadSong(id: string, providers?: AudioProviders): Promise<void>;
	startSong(): Promise<void>;
	pauseSong(): void;
	resumeSong(): Promise<void>;
	stopSong(): void;
	playSfx(name: string): void;
	stopAll(): void;
	setNoiseLevel(level: number): void;
}
