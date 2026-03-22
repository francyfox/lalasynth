# Contributing to LalaSynth

Thank you for your interest in contributing. This document covers everything you need to get started.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
- [Code style](#code-style)
- [Submitting a pull request](#submitting-a-pull-request)
- [Extending the project](#extending-the-project)

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Bun](https://bun.sh) | 1.3.4+ | Runtime **and** package manager — replaces Node.js + npm |
| [ffmpeg](https://ffmpeg.org) | 5.0+ | Audio transcoding, waveform generation, album art extraction |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | latest | Required for audio streaming |
| A Chromium-based or Firefox browser | any | Required for yt-dlp cookie extraction |
| Node.js | 18+ | Only used by yt-dlp JS runtime (`--js-runtimes`), not for running the app |

> **Bun is the only supported runtime and package manager.** Do not use `npm`, `yarn`, or `pnpm` — the project relies on Bun-specific APIs (`bun:sqlite`, `Bun.spawn`, etc.) and will not work with Node.js alone.

---

## Local setup

```bash
git clone https://github.com/your-org/lalasynth.git
cd lalasynth
bun install
```

Copy the example environment file and fill in the required values:

```bash
cp apps/api/.env.example apps/api/.env
```

Start all services in watch mode:

```bash
bun run dev
```

- API: http://localhost:3000
- Web: http://localhost:5173
- Swagger UI: http://localhost:3000/swagger

Apply database migrations:

```bash
cd apps/api
bunx drizzle-kit push
```

---

## Project structure

```
lalasynth/
├── apps/
│   ├── api/        # Elysia.js backend (Bun runtime)
│   └── web/        # Svelte 5 + Vite frontend
├── packages/
│   └── ui/         # Shared UI components
└── docs/           # Extended documentation
```

See [AGENTS.md](AGENTS.md) for a full technical breakdown.

---

## Development workflow

1. **Branch** — create a feature branch from `master`
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Code** — make your changes

3. **Format** — Biome enforces tabs and double quotes; run before committing
   ```bash
   bun run format:fix
   ```

4. **Type check**
   ```bash
   bun run check-types
   ```

5. **Lint**
   ```bash
   bun run lint
   ```

6. **Commit** — use [Conventional Commits](https://www.conventionalcommits.org/) style
   ```
   feat: add Spotify lyric provider
   fix: prevent 403 on geo-restricted videos
   docs: update provider guide
   ```

7. **Pull request** — open a PR against `master` with a clear description of what changed and why

---

## Code style

- **Formatter**: [Biome](https://biomejs.dev/) — run `bun run format:fix` before every commit
- **Indentation**: tabs (not spaces)
- **Quotes**: double quotes
- **Language**: TypeScript everywhere, strict mode
- **Naming**: `camelCase` for variables/functions, `PascalCase` for classes/components
- **Imports**: use the `@/` alias (maps to `src/`) — no relative `../../` imports across module boundaries

---

## Submitting a pull request

- Keep PRs focused — one feature or fix per PR
- Include a short description of the motivation, not just what changed
- If your change affects the HTTP API, update or add the relevant Elysia schema
- If your change affects provider behavior, update `docs/adding-providers.md`

---

## Extending the project

### Adding a new audio or lyric provider

See **[docs/adding-providers.md](docs/adding-providers.md)** for a step-by-step guide including interface contracts, registration, and the `validate()` startup check.

### Reporting a bug

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment info (OS, Bun version, browser)