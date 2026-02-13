# AGENTS.md: Guidelines for Working in LalaSynth Repository

## Project Overview
LalaSynth is a reactive karaoke racing game where users compete in typing song lyrics in real-time to synthesized music. Users log in via GitHub, join sessions, select songs with lyrics, and race against others. The "AI synthesis" is simulated via real-time DSP effects (Tone.js) on original audio streams from YouTube (via Invidious API), with lyrics synced from LRCLIB. Includes WebSockets for synchronization, SQLite (via Bun:sqlite) for caching and stats, and visual elements like an anime nun conductor.

Tech Stack:
- Monorepo: Turborepo with Bun as package manager (v1.3.4+)
- Backend: Elysia.js (Bun runtime), Drizzle ORM (Turso/SQLite), WebSockets for sessions
- Frontend: Svelte 5 + Vite 8 (beta), Tone.js for audio
- External: Invidious API (YouTube audio), LRCLIB API (LRC lyrics)
- Deployment: Vercel implied

Key Illusion: No real AI generation; DSP pipelines (PitchShift, BitCrusher, Filter) create "synthetic" sound. Server pretends to "analyze with neural net" while parsing LRC.

## Essential Commands
Run from root (`/home/fox/WebstormProjects/lalasynth`).

### Root (Monorepo)
- **Dev**: `bun run dev` (starts turbo dev for all apps in parallel)
- **Build**: `bun run build` (turbo build, outputs to .next/** for web, etc.)
- **Lint**: `bun run lint` (turbo lint across apps)
- **Format**: `bun run format` (Prettier on TS/TSX/MD files)
- **Type Check**: `bun run check-types` (turbo type checking)
- **Install**: `bun install` (installs deps for all workspaces)

### API (`apps/api`)
- **Dev**: `cd apps/api && bun run --watch src/index.ts` (starts Elysia server on http://localhost:3000)
- **DB Migrations**: Use Drizzle Kit: `bunx drizzle-kit generate` and `bunx drizzle-kit push` (from api dir)
- **Stop Gracefully**: Ctrl+C handles SIGINT/SIGTERM, closes server/DB.

### Web (`apps/web`)
- **Dev**: `cd apps/web && bun run dev` (Vite dev server, http://localhost:5173)
- **Build**: `cd apps/web && bun run build` (Vite build to dist/)
- **Preview**: `cd apps/web && bun run preview`
- **Check**: `cd apps/web && bun run check` (Svelte check + TSC)

### Turbo Caching
- Turbo caches builds based on inputs (source, .env*). Clear with `bunx turbo run build --force`.
- Dev tasks are non-cached and persistent.

## Code Organization
- **Root**: Configs (package.json, turbo.json, .npmrc for Bun). Workspaces: apps/*, packages/* (packages empty so far).
- **apps/api**:
  - `src/index.ts`: Elysia app setup, routes import, server listen (port 3000), graceful shutdown.
  - `src/routes.ts`: Root routes, imports controllers (e.g., UserController).
  - `src/modules/user`: Schemas (user.schema.ts with Zod), controllers (user.controller.ts).
  - `src/modules/session`: Schemas (session.schema.ts).
  - `src/env.ts`: Env validation (likely @t3-oss/env-core).
  - Config: drizzle.config.ts (DB migrations).
- **apps/web**:
  - Standard Svelte + Vite template: `src/App.svelte` (basic counter example), `src/main.ts` (mount App), `src/lib/Counter.svelte`.
  - Assets: `src/assets/`, public: `public/`.
  - Config: svelte.config.js, vite.config.ts, tsconfig*.json.
- No shared packages yet. DB: SQLite via @libsql/client, Drizzle ORM.

## Naming Conventions and Style
- **Languages**: TypeScript everywhere (strict mode implied via tsconfig).
- **Backend**: Elysia routing with t (TypeBox) schemas. Controllers in modules (e.g., user.controller.ts). CamelCase vars/functions, PascalCase components/classes. Imports with @/ alias (e.g., '@/routes').
- **Frontend**: Svelte 5 (script lang="ts"). Reactive stores/vars in $: syntax. CSS scoped in <style>. Vite aliases for src.
- **General**: Prettier formatting (2-space indent). No ESLint config visible; follow TS errors. Use Bun natives (bun:sqlite). Env vars via .env* files (gitignored).
- **DB**: Drizzle schemas with Zod integration (drizzle-typebox). Tables likely for users, sessions, stats (cuid2 for IDs).

## Testing Approach
- No tests implemented yet (api package.json: "test": "echo no test && exit 1").
- Vitest/Jest possible via Vite for web; Bun test for API. Add when implementing features.
- Integration: Mock WebSockets/Audio APIs. E2E: Playwright/Cypress for game flow.

## Important Gotchas and Patterns
- **Bun Runtime**: Use `bun run` for scripts. No Node polyfills needed; but ensure deps compatible (e.g., Elysia latest works with Bun).
- **Audio/WebSockets**: Real-time sync critical—use Tone.Transport for audio positioning. Leader progress (ms) broadcast via WS. Cache LRC/MIDI in DB to avoid API hits.
- **DSP Pipeline**: Chain Tone.js effects: Sampler -> BitCrusher (8-bit) -> PitchShift (robot) -> Filter (dynamic lowpass on errors). Buffer audio_url from Invidious.
- **Sessions**: WS rooms for multiplayer. Leader selects song; others hear leader's "extraction" audio. Stats: WPM, wins, GitHub links.
- **DB**: Turso (libsql) for prod; local SQLite. Migrations via Drizzle Kit. Graceful close on shutdown.
- **Monorepo**: Changes in shared (future packages) trigger turbo rebuilds. Watch for .next/cache exclusions.
- **External APIs**: Rate-limit Invidious/LRCLIB. Fallback for no-lyrics songs.
- **Visuals**: Anime nun (Spine/Lottie): States for idle, win, winx2 (ahegao). Display stats (WPM/wins) in corner.
- **Security**: GitHub OAuth for auth. No secrets in code; use env. Validate all inputs with Zod/t.
- **Non-Obvious**: Frontend still template—implement game logic (Vue-like refs in Svelte). Backend has user/session modules; expand for songs/sessions. No CI yet; add turbo to GitHub Actions.

## Development Workflow
1. Install: `bun install`
2. Dev: `bun run dev` (API:3000, Web:5173)
3. Add features: Follow modules pattern (e.g., new song module). Update turbo tasks if needed.
4. Test manually: Login, join session, select song, race.
5. Commit: Use conventional commits; turbo prune for clean builds.

This doc based on current state (Feb 13, 2026). Update as project evolves.