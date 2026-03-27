# Building & Running

Lalasynth ships two server apps — `api` (port 3000) and `master` (port 4000). Both compile to bundled JS via Bun and run with the Bun runtime.

## Build

```bash
# Both apps (from repo root)
bun run build

# Individual apps
cd apps/api && bun run build
cd apps/master && bun run build
```

Output goes to `apps/{app}/dist/index.js`.

## Run

```bash
# Via Make (from repo root)
make run-api
make run-master

# Directly
cd apps/api && bun dist/index.js
cd apps/master && bun dist/index.js
```

## Environment variables

Bun automatically loads `.env` from the current working directory. Make sure a `.env` file exists in the app directory before running.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/master/.env.example apps/master/.env
```