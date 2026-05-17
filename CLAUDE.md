# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lalasynth** is a real-time multiplayer karaoke racing game. Players log in via GitHub/email, join sessions, type song lyrics synced to YouTube audio with DSP effects (Tone.js). The architecture is split into two backend services with a Svelte 5 frontend.

## Monorepo Structure

Turborepo with Bun package manager:
- **apps/api** — Client server (runs on the player's machine). Owns: song fetching/downloading/streaming (yt-dlp + ffmpeg), local song storage, audio file serving, game-session WebSockets, scenes/sounds/stats. Port 3000.
- **apps/master** — Cloud/Docker master server. Owns: Better Auth (GitHub OAuth + email/password), user profiles, badges. Port 5000.
- **apps/web** — Svelte 5 + Vite frontend. Talks to both servers.
- **apps/cli** — Bun CLI (Bunli framework) for managing local songs.
- **packages/ui** — Shared components (`@package/ui`), prefixed with `U`.

## Essential Commands

All from repo root unless noted:

```bash
bun install              # Install all workspace deps
bun run dev              # Start all apps in parallel (API:3000, Master:5000, Web:5173)
bun run build            # Build all apps
bun run format:fix       # Fix formatting with Biome (tab-indented — do this before committing)
bun run check-types      # Type check all apps
bun run lint             # Lint all apps

# Per-app dev
cd apps/api    && bun run --watch src/index.ts   # API dev server
cd apps/master && bun run --watch src/index.ts   # Master dev server
cd apps/web    && bun run dev                     # Vite dev server

# DB migrations (run from respective app dir)
cd apps/api    && bunx drizzle-kit generate && bunx drizzle-kit push
cd apps/master && bunx drizzle-kit generate && bunx drizzle-kit push

# Regenerate OpenAPI type definitions (server must be running)
cd apps/api    && bun run schema   # → src/type.d.ts from localhost:3000/swagger/json
cd apps/master && bun run schema   # → src/type.d.ts from localhost:5000/swagger/json (also exports auth type)

# CLI
cd apps/cli && bun run src/index.ts song download <videoId>
cd apps/cli && bun run src/index.ts song list
```

## System Requirements (host, not npm)

| Tool | Purpose |
|------|---------|
| **Bun 1.3.4+** | Runtime and package manager — no npm/yarn/pnpm |
| **ffmpeg 5.0+** | Audio transcoding (Opus/WebM), waveform, album art |
| **yt-dlp** | YouTube audio streaming/download |

## Environment Variables

**Production env vars are set in Railway** — not committed to `.env` files. See `.env.example` per app for the full list.

### apps/master
| Var | Purpose |
|-----|---------|
| `BETTER_AUTH_BASE_URL` | **Must be the master's own public URL** (e.g. `https://lala-master.shalotts.site`). Used by better-auth to construct OAuth callback URLs. |
| `CLIENT_URL` | Frontend URL — used for CORS and better-auth trusted origins |
| `BETTER_AUTH_SECRET` | `openssl rand -hex 32` |
| `GITHUB_CLIENT_ID / SECRET` | GitHub OAuth app credentials |
| `TURSO_CONNECTION_URL / AUTH_TOKEN` | Production DB. Omit both to use local `data/local.db`. |

### apps/api
| Var | Purpose |
|-----|---------|
| `CLIENT_URL` | Frontend URL — used for CORS |
| `API_URL` | This server's own public URL (default: `http://localhost:PORT`) |
| `CLOUDFLARED_TOKEN` | Cloudflare named tunnel token (optional — skip for no tunnel) |
| `LOCAL_SONGS_DIR` | Path to audio file storage (default `./songs`) |
| `LOCAL_SONGS_AUDIO_BITRATE_KBPS` | Opus encoding bitrate, 48–320 (default 128) |
| `TURSO_*` | Same pattern as master |

### apps/web (Vite, prefix `VITE_`)
| Var | Purpose |
|-----|---------|
| `VITE_API_URL` | Client server URL (apps/api) |
| `VITE_MASTER_URL` | Master server URL (default `http://localhost:5000`) |

## Architecture & Key Patterns

### Two-backend model
The frontend has two API clients:
- `lib/api.ts` → `client` (openapi-fetch) → `apps/api` at `VITE_API_URL`
- `lib/master-api.ts` → `masterClient` (openapi-fetch) → `apps/master` at `VITE_MASTER_URL`

Both clients throw `RateLimitError` on 429. TanStack Query does not retry on `RateLimitError`; instead it pauses all background refetches via `focusManager.setFocused(false)` until `retryAfter` elapses.

### Auth flow
Better Auth lives entirely in `apps/master`. `apps/web`'s `auth-client.ts` points to `VITE_MASTER_URL`. Session is cached in TanStack Query under key `["session"]`. `authGuard` checks the cache before redirecting to `/auth`. After login → `/menu`. From menu: Single Player → `/lobby`, Multi Player (disabled). Social sign-in callback also lands at `/menu`.

### Audio chain (apps/web)
`createSongPlayer()` in `lib/audio/song-player.svelte.ts` is the **only** place that calls `createMediaElementSource`. Creating a second source on the same `<audio>` element throws. Chain: `audioEl → MediaElementSource → AnalyserNode → GainNode → destination`. `audioManager` (singleton) delegates `bg` (background music) and `song` (gameplay) to separate player instances.

### Svelte 5 stores
Complex state lives in `.svelte.ts` files using runes (`$state`, `$derived`, `$effect`). Factory functions export singletons. `$effect.root()` is used for effects that must survive outside component lifecycle. Note: `lib/stores/auth.ts` uses legacy Svelte 4 `writable()` — this is intentional for that file.

### Pluggable audio/lyric providers (apps/api)
Defined in `modules/song/song.provider.ts`. Each provider implements `validate()` — disabled at startup if unavailable. Current audio providers: `localAudio`, `ytdlp`. Lyric providers: `lrclib`, `localLyric`.

### API type generation
`apps/api/src/type.d.ts` and `apps/master/src/type.d.ts` are generated files (openapi-typescript). Regenerate with `bun run schema` while the server is running. The master's `type.d.ts` is also exported as `@app/master` for use in the web app's auth-client.

### Database
Both backends use Drizzle ORM + libsql. Without `TURSO_CONNECTION_URL`, falls back to `file:data/local.db` (directory auto-created). Migrations live in `migrations/` per app and run automatically on server start.

- **ID generation**: `@paralleldrive/cuid2` — always use `createId()` from this package for primary keys, never `crypto.randomUUID()`.
- **Timestamps**: `integer({ mode: "timestamp_ms" })` with default `sql\`(cast(unixepoch('subsecond') * 1000 as integer))\``.

### Routing (apps/web)
`@roxi/routify` — file-based routing under `src/routes/`. Use `$goto('/path')` for navigation, `_module.svelte` for layout wrappers. Guards (e.g. `authGuard`) are wired in `_module.svelte` via route meta.

### Forms (apps/web)
`felte` + `@felte/validator-zod` for form handling and validation. Schema defined with `zod`, passed to `validator({ schema })`.

### Cloudflare Tunnel (apps/api)
Already partially implemented in `src/libs/cloudflared.ts` using the `cloudflared` npm package (auto-downloads binary). Currently only named tunnel mode via `CLOUDFLARED_TOKEN` env var. Quick tunnel (random URL) not yet implemented.

### Biome formatting
- Biome is the formatter/linter. **Tab indentation, double quotes.**
- Biome explicitly **excludes `.svelte` files** — svelte-check handles those.
- Run `bun run format:fix` before committing. Svelte files follow the same tab/double-quote style manually.

### Deployment
- `apps/master` → Railway (env vars configured there)
- `apps/web` → Render Static Site or CDN
- `apps/api` → compiled binary (`bun build --compile`) runs on player's machine
- `docker-compose.yml` deploys master only (api commented out) — intended for LAN/offline events

## Critical Gotchas

1. **`BETTER_AUTH_BASE_URL` in master must equal the server's own public URL** — better-auth uses it to build the GitHub OAuth callback path. Wrong value = OAuth broken.
2. **Do not use `npm`/`yarn`/`pnpm`** — Bun-specific APIs (`bun:sqlite`, `Bun.spawn`, `Bun.file`) are used throughout.
3. **Only one `createMediaElementSource` per `<audio>` element** — only `createSongPlayer` may do this.
4. **`ffmpeg` and `yt-dlp` must be installed on the host** — both are shell-invoked via `Bun.spawn`.
5. **Svelte 5 runes only** in new `.svelte` and `.svelte.ts` files — no `$:` or `writable()` (except the existing `auth.ts`).
6. **Rate-limit external APIs** (Invidious, LRCLIB) — cache results in DB.