import { LocalAudioProvider } from "@/modules/song/adapters/local-audio.adapter";
import { LocalLyricProvider } from "@/modules/song/adapters/local-lyric.adapter";
import { LrclibProvider } from "@/modules/song/adapters/lrclib.adapter";
import { YtdlpProvider } from "@/modules/song/adapters/ytdlp.adapter";
import type { AudioBaseProvider, LyricBaseProvider } from "@/modules/song/song.types";
import {
	AUDIO_PROVIDERS,
	LYRIC_PROVIDERS,
	type AudioProvider,
	type LyricProvider,
} from "@/modules/song/song.types";

export { AUDIO_PROVIDERS, LYRIC_PROVIDERS };

async function validateProviders<
	T extends { validate(): Promise<{ ok: boolean; reason?: string }> },
>(providers: Map<string, T>): Promise<void> {
	for (const [key, provider] of providers) {
		const { ok, reason } = await provider.validate();
		if (ok) continue;
		console.warn(`[song-provider] "${key}" disabled: ${reason}`);
		providers.delete(key);
	}
}

export const songProvider = async () => {
	const audioProviders = new Map<string, AudioBaseProvider>([
		[AUDIO_PROVIDERS.localAudio, await LocalAudioProvider()],
		[AUDIO_PROVIDERS.ytdlp, YtdlpProvider()],
	]);

	const lyricProviders = new Map<string, LyricBaseProvider>([
		[LYRIC_PROVIDERS.lrclib, LrclibProvider()],
		[LYRIC_PROVIDERS.localLyric, LocalLyricProvider()],
	]);

	await validateProviders(audioProviders);
	await validateProviders(lyricProviders);

	function getAudioProvider(id: AudioProvider): AudioBaseProvider {
		const provider = audioProviders.get(id);
		if (!provider) throw new Error(`Audio provider "${id}" is not available`);
		return provider;
	}

	function getLyricProvider(id: LyricProvider): LyricBaseProvider {
		const provider = lyricProviders.get(id);
		if (!provider) throw new Error(`Lyric provider "${id}" is not available`);
		return provider;
	}

	return {
		getAudioProvider,
		getLyricProvider,
		availableAudioProviders: [...audioProviders.keys()] as AudioProvider[],
		availableLyricProviders: [...lyricProviders.keys()] as LyricProvider[],
	};
};

export type SongProviderInstance = Awaited<ReturnType<typeof songProvider>>;