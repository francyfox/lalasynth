# Building & Running Binaries

Lalasynth ships two server apps — `api` (port 3000) and `master` (port 4000) — each of which can be compiled into a standalone executable via Bun's `--compile` flag. No Bun installation required on the target machine.

## Supported platforms

| Key | Target | OS |
|-----|--------|----|
| `linux` | `bun-linux-x64` | Linux x86_64 |
| `linux-arm64` | `bun-linux-arm64` | Linux ARM64 (Raspberry Pi, AWS Graviton) |
| `windows` | `bun-windows-x64` | Windows x86_64 |
| `macos` | `bun-darwin-arm64` | macOS Apple Silicon (M1/M2/M3) |
| `macos-x64` | `bun-darwin-x64` | macOS Intel |

## Build

### One platform

```bash
# From the app directory
cd apps/api
bun run build.ts --bin linux

cd apps/master
bun run build.ts --bin macos
```

### All platforms at once (via Make)

```bash
make build-bin           # both apps, all platforms
make build-bin-api       # api only, all platforms
make build-bin-master    # master only, all platforms

# Specific app + platform
make build-bin-for APP=api PLATFORM=linux-arm64
```

Binaries are written to `apps/{app}/dist/bin/`:

```
apps/api/dist/bin/
  api-linux-x64
  api-linux-arm64
  api-windows-x64.exe
  api-macos-arm64
  api-macos-x64

apps/master/dist/bin/
  master-linux-x64
  ...
```

## Run

### Via Make (auto-detects current platform)

```bash
make run-api
make run-master
```

### Directly

```bash
./apps/api/dist/bin/api-linux-x64
./apps/master/dist/bin/master-linux-x64
```

> The binary includes the Bun runtime — no additional dependencies needed to run it.
> External tools (`ffmpeg`, `yt-dlp`) must still be present on the host for audio functionality.