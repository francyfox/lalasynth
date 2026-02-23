# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lalasynth** is a real-time multiplayer karaoke racing game built with TypeScript, Bun, Elysia, and Svelte. Players compete in typing song lyrics synchronized to YouTube audio with real-time DSP effects (via Tone.js). Features GitHub OAuth authentication, WebSocket multiplayer sessions, and a SQLite database for caching and stats.

See **AGENTS.md** for detailed architecture and technical specifications.

## Monorepo Structure

Turborepo with Bun package manager:
- **apps/api**: Elysia.js backend (Bun runtime) with Drizzle ORM
- **apps/web**: Svelte 5 + Vite frontend
- **packages/ui**: Shared UI components (package)

All commands run from repo root unless specified otherwise.

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
bunx drizzle-kit push          # Apply migrations to local.db
```

### Web (`apps/web`)
```bash
cd apps/web
bun run dev              # Vite dev server (:5173)
bun run build            # Vite build to dist/
bun run check            # Svelte check + TypeScript check
```

## Code Organization

### API (`apps/api/src`)
- **index.ts**: Elysia app setup, routes import, server listen (port 3000), graceful shutdown
- **routes.ts**: Root routes, imports controllers from modules
- **modules/**: Feature-based organization
  - `user/`: Schemas (Zod), controllers, business logic
  - `session/`: Session schemas and handlers
- **env.ts**: Environment validation
- **drizzle.config.ts**: Database migration config

Local SQLite database: `apps/api/local.db`

### Web (`apps/web/src`)
- **App.svelte**: Root component
- **main.ts**: Entry point (mounts App)
- **lib/**: Reusable utilities and stores
  - `stores/session.ts`: User session store (reactive)
  - `query-client.ts**: TanStack Query client with error toast
  - `auth-client.ts`: Better Auth client
  - `guards/`: Route guards (auth.guard.ts)
- **routes/**: Page components (Routify v3)
- **assets/**: Images and static files

## Key Patterns and Conventions

### TypeScript & Formatting
- **Formatting**: Biome with **tab indentation** (not spaces)
- **Quote style**: Double quotes (enforced by Biome)
- **Language**: TypeScript everywhere (strict mode)
- **Case**: camelCase for vars/functions, PascalCase for components/classes

### Backend (Elysia)
- Type-safe routing with TypeBox schemas (t)
- Module-based organization: each feature gets a `modules/{name}` folder
- Controllers handle HTTP logic; separate schema files for validation
- Use Bun natives (bun:sqlite) where possible
- Alias imports: `@/` points to src root

### Frontend (Svelte 5)
- Reactive declarations: `$:` for computed state
- Stores for global state (use TanStack Query for async data)
- Scoped CSS in `<style>` blocks
- TS script blocks: `<script lang="ts">`
- Alias imports: `@/` points to src root

### Database
- Drizzle ORM with SQLite (local) / Turso (production)
- Tables for users, sessions, stats
- IDs use cuid2
- Run migrations from `apps/api`: `bunx drizzle-kit generate && push`

### Monorepo/Turbo
- Turbo caches builds based on source and `.env*` files
- Clear cache: `bunx turbo run build --force`
- Dev tasks are non-cached and persistent
- Changes in shared packages (`packages/*`) trigger rebuilds

## Critical Gotchas

1. **Biome Formatting**: Uses **tabs**, not spaces. Run `bun run format:fix` before committing.
2. **Bun Runtime**: All scripts via `bun run`. Ensure dependencies are Bun-compatible (Elysia is).
3. **External APIs**: Rate-limit Invidious (YouTube audio) and LRCLIB (lyrics). Cache results in DB.
4. **Real-time Sync**: WebSocket rooms for multiplayer. Use Tone.Transport for precise audio positioning. Leader progress broadcast in milliseconds.
5. **Audio Pipeline**: Chain Tone.js effects (Sampler → BitCrusher → PitchShift → Filter) for "synthetic" sound effect.
6. **Environment Variables**: No secrets in code. Use `.env` files (gitignored).
7. **Frontend Template State**: `apps/web` is still largely a Svelte template. Game logic not yet fully implemented.

## Testing

Currently no automated tests. Approach when adding features:
- **API**: Bun's test runner or Vitest
- **Web**: Vitest (via Vite) or Cypress/Playwright for E2E
- **Mocking**: Mock WebSockets and Tone.js audio APIs in unit tests

## Development Workflow

1. **Install**: `bun install`
2. **Develop**: `bun run dev` (starts API and Web in watch mode)
3. **Format before commit**: `bun run format:fix`
4. **Type check**: `bun run check-types`
5. **Build locally**: `bun run build` (outputs to `.next/**`)

## Additional Resources

- **AGENTS.md**: Comprehensive technical specifications, deployment details, security notes
- **biome.json**: Formatter/linter config (tab indentation, recommended linter rules)
- **turbo.json**: Monorepo task definitions and caching rules
