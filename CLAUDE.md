# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lalasynth** is a real-time multiplayer karaoke racing game built with TypeScript, Bun, Elysia, and Svelte. Players compete in typing song lyrics synchronized to YouTube audio with real-time DSP effects (via Tone.js). Features GitHub OAuth authentication, WebSocket multiplayer sessions, and a SQLite database for caching and stats.

See **AGENTS.md** for detailed architecture and technical specifications.

## Monorepo Structure

Turborepo with Bun package manager:
- **apps/api**: Elysia.js backend (Bun runtime) with Drizzle ORM
- **apps/web**: Svelte 5 + Vite frontend
- **apps/cli**: Bun CLI tool (Bunli framework) for song management tasks
- **packages/ui**: Shared UI component library (`@package/ui`)

All commands run from repo root unless specified otherwise.

## System Requirements

These tools must be installed on the host system (not npm packages):

| Tool | Version | Purpose |
|------|---------|---------|
| **Bun** | 1.3.4+ | Runtime **and** package manager — replaces Node.js + npm entirely |
| **ffmpeg** | 5.0+ | Audio transcoding (Opus/WebM), waveform generation, album art extraction |
| **yt-dlp** | latest | YouTube audio streaming and download |
| Node.js | 18+ | Only required by yt-dlp `--js-runtimes`, not for running the app |

> **Do not use npm, yarn, or pnpm.** The project relies on Bun-specific APIs (`bun:sqlite`, `Bun.spawn`, `Bun.file`) and will not work with Node.js alone.

## Essential Commands

### Root (Monorepo)
```bash
bun run dev              # Start all apps in parallel (API:3000, Web:5173)
bun run build            # Build all apps
bun run lint             # Lint all apps
bun run format           # Check formatting with Biome (tab-indented)
bun run format:fix       # Fix formatting
bun run check-types      # Type check all apps
bun install              # Install dependencies for all workspaces
```

### API (`apps/api`)
```bash
cd apps/api
bun run --watch src/index.ts    # Dev server (Elysia on :3000)
bunx drizzle-kit generate       # Generate DB migrations
bunx drizzle-kit push           # Apply migrations to local.db
```

### Web (`apps/web`)
```bash
cd apps/web
bun run dev              # Vite dev server (:5173)
bun run build            # Vite build to dist/
bun run check            # Svelte check + TypeScript check
```

### CLI (`apps/cli`)
```bash
cd apps/cli
bun run src/index.ts song download <videoId>   # Download a song locally
bun run src/index.ts song list                 # List indexed songs
```

## Code Organization

### API (`apps/api/src`)
- **index.ts**: Elysia app setup, routes, server listen (port 3000), graceful shutdown
- **routes.ts**: Root routes, imports controllers from modules
- **modules/**: Feature-based organization
  - `song/`: Song fetching, downloading, caching; pluggable audio/lyric adapters
  - `stats/`: System stats endpoint (CPU, memory)
  - `user/`: Schemas (Zod), controllers, business logic
  - `session/`: WebSocket session schemas and handlers
  - `badge/`: SVG badge generation for GitHub profile display
- **env.ts**: Environment validation (Zod)
- **drizzle.config.ts**: Database migration config

Local SQLite database: `apps/api/local.db`

### Web (`apps/web/src`)
- **App.svelte**: Root component
- **main.ts**: Entry point (mounts App)
- **lib/**: Reusable utilities and stores
  - `stores/songs.svelte.ts`: Core audio store — owns the entire Web Audio chain
  - `stores/audio-manager.svelte.ts`: Top-level orchestrator delegating to song/chat stores
  - `stores/settings.svelte.ts`: Persistent user settings (volume, resolution, stats toggle)
  - `stores/session.ts`: User session store (reactive, Better Auth)
  - `stores/stats.ts`: TanStack Query wrapper for system stats polling
  - `query-client.ts`: TanStack Query client with error toasts and rate-limit recovery
  - `auth-client.ts`: Better Auth client
  - `guards/`: Route guards (auth.guard.ts, skip-intro.guard.ts)
- **routes/**: Page components (Routify v3)
- **components/**: Feature components organized by domain
- **assets/**: Images and static files

### CLI (`apps/cli/src`)
- Uses the **Bunli** framework for CLI argument parsing
- `commands/song/`: Song download command — calls API endpoints or runs yt-dlp directly

### UI Package (`packages/ui/src`)
- All components are prefixed with `U` (e.g., `UButton`, `USearchSong`, `UTable`)
- Import via `@package/ui` or `@package/ui/index`
- Key components: `USearchSong`, `ULyricSync`, `UAudioTimeline`, `UWaveform`, `UCounter`, `UTable`, `UBadge`, `UModal`
- Each component may have a companion `*.service.ts` or `*.svelte.ts` for state logic

## Key Patterns and Conventions

### TypeScript & Formatting
- **Formatter**: Biome (NOT Prettier) with **tab indentation** (not spaces)
- **Quote style**: Double quotes (enforced by Biome)
- **Language**: TypeScript everywhere (strict mode)
- **Case**: camelCase for vars/functions, PascalCase for components/classes
- **Imports**: Use `@/` alias (maps to `src/`) — no relative `../../` imports across module boundaries

### Backend (Elysia)
- Type-safe routing with TypeBox schemas (`t`)
- Module-based organization: each feature gets a `modules/{name}` folder
- Controllers handle HTTP logic; separate schema files for validation
- Use Bun natives (`bun:sqlite`, `Bun.spawn`, `Bun.file`) where possible
- Alias imports: `@/` points to `src/`

### Frontend (Svelte 5)
- Use **Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`, `$bindable`) — not legacy Svelte 4 syntax
- `$effect.root()` for effects that need to survive outside component lifecycle (e.g., in `.svelte.ts` stores)
- **Runed** library for reactive DOM utilities: `IsDocumentVisible`, `Debounced`, etc.
- TanStack Query (`createQuery`, `createMutation`) for all async server data
- Scoped CSS in `<style>` blocks; DaisyUI + Tailwind for utility classes
- TS script blocks: `<script lang="ts">`
- Alias imports: `@/` points to `src/`, `@package/ui` for shared components

### State Management (`.svelte.ts` files)
- Complex stores live in `.svelte.ts` files (runes work outside components)
- Factory functions (`createSongStore()`) are preferred over singletons for testability
- Singletons are exported as a single instantiation at module level

### Audio Architecture
- **The store owns the Web Audio chain** — no other component creates `AudioContext` or `MediaElementAudioSourceNode`
- Chain: `audioEl → MediaElementSource → AnalyserNode → GainNode → destination`
- `GainNode` controls volume (fade in/out via `linearRampToValueAtTime`)
- `AnalyserNode` feeds waveform/visualizer components
- Components receive `audioEl` and `analyserNode` as props — they never build their own chain
- Volume sync runs via `$effect.root` so it applies even outside game playback (e.g., ULyricSync preview)

### Pluggable Provider Pattern
- Audio and lyric sources are adapters implementing a common interface (`song.provider.ts`)
- Registered providers: YouTube (via yt-dlp/Invidious), Local file system
- Add new providers by implementing the interface and registering in the provider registry

### Rate Limit Handling
- Backend: global `elysia-rate-limit`; `/stats` is excluded from the global limiter and has its own 60 req/min limit
- Frontend: `RateLimitError` class thrown by openapi-fetch middleware on 429 responses
- TanStack Query retries are disabled for `RateLimitError`
- On rate limit: `focusManager.setFocused(false)` pauses all background refetches; restored after `retryAfter` seconds
- Stats polling uses `IsDocumentVisible` + `refetchIntervalInBackground: false` to avoid unnecessary traffic

### Database
- Drizzle ORM with SQLite (local) / Turso (production)
- Tables for users, sessions, songs, stats
- IDs use cuid2
- Run migrations from `apps/api`: `bunx drizzle-kit generate && bunx drizzle-kit push`

### Audio File Storage
- Audio stored as **Opus/WebM** (`libopus`, 128 kbps by default, configurable via `LOCAL_SONGS_AUDIO_BITRATE_KBPS`)
- Video track is stripped during download via ffmpeg pipeline: `yt-dlp stdout → ffmpeg stdin`
- Album art stored as **64×64 WebP** (center-cropped with lanczos filter)
- Files live in the path configured by `LOCAL_SONGS_DIR` env var

### Badge System
- `/user/:id/badge` serves an SVG badge for embedding in GitHub profiles
- Displays username and top stats (WPM, wins)

### Monorepo/Turbo
- Turbo caches builds based on source and `.env*` files
- Clear cache: `bunx turbo run build --force`
- Dev tasks are non-cached and persistent
- Changes in shared packages (`packages/*`) trigger rebuilds

## Critical Gotchas

1. **Biome Formatting**: Uses **tabs**, not spaces. Run `bun run format:fix` before committing.
2. **Bun Runtime Only**: Do not use `npm`, `yarn`, or `pnpm`. All scripts via `bun run`.
3. **ffmpeg & yt-dlp required**: Both must be installed on the host — they are shell-invoked via `Bun.spawn`, not npm packages.
4. **Svelte 5 Runes**: Use runes syntax (`$state`, `$derived`, `$effect`), not legacy `$:` or `writable()` stores.
5. **Audio Chain Ownership**: Only `createSongStore` (in `songs.svelte.ts`) may call `createMediaElementSource`. Creating a second source node on the same `<audio>` element will throw.
6. **External APIs**: Rate-limit Invidious (YouTube audio) and LRCLIB (lyrics). Cache results in DB.
7. **Real-time Sync**: WebSocket rooms for multiplayer. Use Tone.Transport for precise audio positioning. Leader progress broadcast in milliseconds.
8. **Audio DSP Pipeline**: Tone.js effects chain (BitCrusher → PitchShift → Filter) for "synthetic" sound effect — initialized via `Tone.getContext()`.
9. **Environment Variables**: No secrets in code. Use `.env` files (gitignored). See `apps/api/.env.example`.
10. **Frontend Game Logic**: `apps/web` game screens are still partially stub/template. Core audio and lobby plumbing is done; game loop not fully wired.

## Testing

Currently no automated tests. Approach when adding features:
- **API**: Bun's test runner (`bun test`) or Vitest
- **Web**: Vitest (via Vite) or Playwright for E2E
- **CLI**: Test manually via `bun run src/index.ts song download <videoId>`
- **Mocking**: Mock WebSockets and Tone.js audio APIs in unit tests; do **not** mock the database (use real SQLite in-memory)

## Development Workflow

1. **Install**: `bun install`
2. **Migrate DB**: `cd apps/api && bunx drizzle-kit push`
3. **Develop**: `bun run dev` (starts API on :3000 and Web on :5173 in watch mode)
4. **Format before commit**: `bun run format:fix`
5. **Type check**: `bun run check-types`
6. **Build**: `bun run build`

## Additional Resources

- **AGENTS.md**: Comprehensive technical specifications, deployment details, security notes
- **docs/CONTRIBUTING.md**: Setup guide and contribution workflow
- **docs/adding-providers.md**: How to add new audio or lyric providers
- **biome.json**: Formatter/linter config (tab indentation, recommended linter rules)
- **turbo.json**: Monorepo task definitions and caching rules
