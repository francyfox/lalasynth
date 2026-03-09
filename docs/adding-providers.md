# Adding Song & Lyric Providers

Lalasynth uses a provider system to decouple audio sourcing and lyric fetching from the rest of the application. You can plug in new providers without touching the controller or business logic — just implement the interface, register the provider, and add its ID to the constants.

---

## Concepts

| Term | What it does |
|------|-------------|
| **Audio provider** | Resolves a song identifier → metadata + audio stream |
| **Lyric provider** | Searches for synced/plain lyrics by song title and duration |
| **`validate()`** | Called at startup; returning `{ ok: false }` disables the provider automatically |

Providers that fail `validate()` are removed from the active map and never exposed to requests. This means a missing binary, a blocked IP, or an unreachable API will not crash the server — the provider is simply not available.

---

## File layout

```
apps/api/src/modules/song/
├── providers/
│   ├── ytdlp.provider.ts        # Audio: yt-dlp + youtubei.js
│   ├── local-audio.provider.ts  # Audio: local .webm files
│   └── lrclib.provider.ts       # Lyrics: lrclib.net
├── song.provider.ts             # Registry — registers & validates all providers
├── song.types.ts                # Interfaces + provider ID constants
└── song.controller.ts           # HTTP layer — selects provider from query param
```

---

## Step 1 — Implement the interface

### Audio provider (`AudioBaseProvider`)

```ts
// apps/api/src/modules/song/providers/my-audio.provider.ts

import type { AudioBaseProvider, Song } from "@/modules/song/song.types";

export function MyAudioProvider(): AudioBaseProvider {
	async function getSong(urlOrId: string): Promise<Song> {
		// Resolve the identifier and return song metadata.
		// Must return an object matching the Song schema:
		//   { videoId, title?, author?, duration?, audioUrl, mimeType, bitrate }
		return {
			videoId: urlOrId,
			title: "My Song",
			audioUrl: `https://example.com/audio/${urlOrId}.webm`,
			mimeType: 'audio/webm; codecs="opus"',
			bitrate: 128000,
		};
	}

	async function streamAudio(urlOrId: string) {
		// Return a ReadableStream of raw audio bytes and its MIME type.
		const res = await fetch(`https://example.com/audio/${urlOrId}.webm`);
		return {
			stream: res.body as ReadableStream<Uint8Array>,
			mimeType: 'audio/webm; codecs="opus"',
		};
	}

	async function validate(): Promise<{ ok: boolean; reason?: string }> {
		// Check that your service is reachable and configured correctly.
		// Return { ok: false, reason: "..." } to disable this provider at startup.
		try {
			const res = await fetch("https://example.com/health");
			if (!res.ok) return { ok: false, reason: `Health check failed: ${res.status}` };
			return { ok: true };
		} catch (err) {
			return {
				ok: false,
				reason: `Unreachable: ${err instanceof Error ? err.message : String(err)}`,
			};
		}
	}

	return { id: "my-audio", getSong, streamAudio, validate };
}
```

### Lyric provider (`LyricBaseProvider`)

```ts
// apps/api/src/modules/song/providers/my-lyric.provider.ts

import type { Lyric, LyricBaseProvider } from "@/modules/song/song.types";

export function MyLyricProvider(): LyricBaseProvider {
	async function getLyrics(search: string, duration: number): Promise<Lyric[]> {
		const res = await fetch(`https://example.com/lyrics?q=${encodeURIComponent(search)}`);
		const data = await res.json() as Lyric[];
		// Must filter out instrumental tracks and entries without synced lyrics —
		// the game requires word-level timing for every song.
		return data
			.filter((l) => !l.instrumental && l.syncedLyrics)
			.sort((a, b) => Math.abs(a.duration - duration) - Math.abs(b.duration - duration));
	}

	async function validate(): Promise<{ ok: boolean; reason?: string }> {
		try {
			await fetch("https://example.com/lyrics?q=test");
			return { ok: true };
		} catch (err) {
			return {
				ok: false,
				reason: `Lyric API unreachable: ${err instanceof Error ? err.message : String(err)}`,
			};
		}
	}

	return { id: "my-lyrics", getLyrics, validate };
}
```

---

## Step 2 — Register the ID constant

Open `apps/api/src/modules/song/song.types.ts` and add your provider's ID to the appropriate constant:

```ts
// song.types.ts

export const AUDIO_PROVIDERS = {
	ytdlp: "ytdlp",
	localAudio: "local-audio",
	myAudio: "my-audio",          // <-- add this
} as const;

export const LYRIC_PROVIDERS = {
	lrclib: "lrclib",
	myLyrics: "my-lyrics",        // <-- add this
} as const;
```

The derived types `AudioProvider` and `LyricProvider` are inferred automatically — no further type changes needed.

---

## Step 3 — Add to the registry

Open `apps/api/src/modules/song/song.provider.ts` and add your provider to the map:

```ts
import { MyAudioProvider } from "@/modules/song/providers/my-audio.provider";
import { MyLyricProvider } from "@/modules/song/providers/my-lyric.provider";

export const songProvider = async () => {
	const audioProviders = new Map<string, AudioBaseProvider>([
		[AUDIO_PROVIDERS.localAudio, await LocalAudioProvider()],
		[AUDIO_PROVIDERS.ytdlp, YtdlpProvider()],
		[AUDIO_PROVIDERS.myAudio, MyAudioProvider()],    // <-- add this
	]);

	const lyricProviders = new Map<string, LyricBaseProvider>([
		[LYRIC_PROVIDERS.lrclib, LrclibProvider()],
		[LYRIC_PROVIDERS.myLyrics, MyLyricProvider()],   // <-- add this
	]);

	// validate() is called for every provider here — failed ones are removed
	// ...
};
```

If your provider needs async initialization (e.g. connecting to a database), make your factory function async and `await` it in the map initializer, just like `LocalAudioProvider`.

---

## Step 4 — Use it in a request

Clients select a provider via query parameters. No controller changes are required.

```
GET /song/dQw4w9WgXcQ?audioProvider=my-audio&lyricProvider=my-lyrics
GET /song/stream/dQw4w9WgXcQ?audioProvider=my-audio
```

If no query param is supplied the controller falls back to the defaults (`ytdlp` for audio, `lrclib` for lyrics).

---

## The `validate()` contract

`validate()` is called once when the server starts, before any request is served. Use it to:

- Check that required binaries are installed (`which yt-dlp`)
- Verify that credentials or API keys are present in the environment
- Confirm that the upstream service responds (lightweight HEAD or search request)
- Check that local directories or files exist

```ts
async function validate(): Promise<{ ok: boolean; reason?: string }> {
	const key = process.env.MY_API_KEY;
	if (!key) return { ok: false, reason: "MY_API_KEY is not set" };
	return { ok: true };
}
```

A provider that returns `{ ok: false }` is silently removed from the map and logs a warning to the console. Requests that specify a disabled provider receive a runtime error (`"Audio provider X is not available"`).

---

## Interfaces reference

```ts
// song.types.ts

interface AudioBaseProvider {
	readonly id: string;
	getSong(url: string): Promise<Song | unknown>;
	streamAudio(url: string): Promise<{ stream: ReadableStream<Uint8Array>; mimeType: string }>;
	validate(): Promise<{ ok: boolean; reason?: string }>;
}

interface LyricBaseProvider {
	readonly id: string;
	getLyrics(search: string, duration: number): Promise<Lyric | unknown>;
	validate(): Promise<{ ok: boolean; reason?: string }>;
}
```

```ts
// song.schema.ts — Song shape

{
	videoId:   string
	title?:    string
	author?:   string
	duration?: number
	audioUrl:  string   // URL returned to the client for playback
	mimeType:  string
	bitrate:   number
}
```

```ts
// song.schema.ts — Lyric shape

{
	id:           number
	name:         string
	trackName:    string
	artistName:   string
	albumName:    string
	duration:     number
	instrumental: boolean
	plainLyrics:  string | null
	syncedLyrics: string | null  // LRC format: "[mm:ss.xx] line text"
}
```