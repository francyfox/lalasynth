# Federated Server Architecture

## Concept

Inspired by classic GameSpy master server architecture (Quake, Counter-Strike, Warcraft 3) — any user can host a server and it appears in the global list automatically. No accounts or tokens required to register.

Users download the `api` package from GitHub Releases, run it locally, and expose it to the internet via a Cloudflare tunnel. The tunnel URL is registered with the central `master` server. The web client (hosted on Render) lets players pick any registered server to play on.

```
[user machine]                [render.com]
  api (local)  ──cloudflared──▶  tunnel URL
                                     │
                              master (register)
                                     │
                              web client (GET /servers)
                                     │
                          player selects server
                                     │
                    web ──────────── api (direct requests)
```

---

## Phase 1 — Master: server registry

### 1.1 Database

Add a `servers` table (Drizzle migration):

| column | type | notes |
|--------|------|-------|
| `id` | cuid2 | primary key |
| `url` | text | cloudflare tunnel URL, unique |
| `name` | text | display name |
| `registered_ip` | text | source IP, used for rate limiting |
| `last_seen_at` | integer | unix ms, updated on heartbeat |
| `created_at` | integer | unix ms |

No `owner_id` — registration is anonymous, like GameSpy.

### 1.2 Endpoints

```
POST   /servers/register   — register or update tunnel URL (rate limited by IP)
POST   /servers/heartbeat  — keep registration alive (every 30s)
DELETE /servers/unregister — called on api shutdown
GET    /servers            — list active servers (last_seen_at within 90s)
```

No `Authorization` header required on any endpoint.

### 1.3 Spam protection (no auth)

| Concern | Mitigation |
|---------|------------|
| Fake server flood | Rate limit: max 3 registrations per IP per hour |
| Dead servers in list | Lazy filter: only return entries where `last_seen_at > now - 90s` |
| Unreachable URLs | `HEAD` request to tunnel URL before confirming registration |
| URL format abuse | Validate URL format; optionally restrict to `*.trycloudflare.com` + custom domains |

### 1.4 Active server definition

A server is considered active if `last_seen_at` is within the last **90 seconds**. No background cleanup job needed — filter on read.

---

## Phase 2 — API: tunnel registration

### 2.1 Cloudflared startup

Add to `scripts/start.sh`:

1. Check `cloudflared` is installed (add to `check_deps`)
2. Start `cloudflared tunnel --url http://localhost:3000` as background process
3. Parse tunnel URL from cloudflared stdout (line matching `trycloudflare.com`)
4. Export URL as env variable for the registration step

### 2.2 Registration on startup

After api is up and tunnel URL is known:

```ts
// apps/api/src/libs/federated.ts
export async function registerWithMaster(tunnelUrl: string) {
	await fetch(`${env.MASTER_URL}/servers/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url: tunnelUrl, name: env.SERVER_NAME }),
	});
}
```

### 2.3 Heartbeat

Send `POST /servers/heartbeat` with `{ url }` every **30 seconds** via `setInterval`.

### 2.4 Graceful unregister

On `SIGTERM`/`SIGINT` call `DELETE /servers/unregister` before shutdown so the server disappears from the list immediately rather than waiting for the 90s timeout.

### 2.5 New env vars for api

```env
# Master server (central, pre-filled in .env.example)
MASTER_URL=https://lalasynth-master.onrender.com

# Display name shown in the server browser
SERVER_NAME=My Lalasynth Server
```

No `MASTER_API_TOKEN` needed.

### 2.6 CORS

Since the web client is on a fixed Render domain, set in `.env.example`:

```env
CLIENT_URL=https://lalasynth.onrender.com
```

The existing Elysia CORS plugin reads `CLIENT_URL` — no code changes needed.

---

## Phase 3 — Web client: server selector

### 3.1 Server list store

```ts
// apps/web/src/stores/servers.svelte.ts
export const serverStore = createQuery({
	queryKey: ["servers"],
	queryFn: () => fetch(`${MASTER_URL}/servers`).then(r => r.json()),
	refetchInterval: 30_000,
});
```

### 3.2 Active server state

```ts
// apps/web/src/stores/active-server.svelte.ts
let activeServerUrl = $state<string>(import.meta.env.VITE_API_URL);

export function setActiveServer(url: string) {
	activeServerUrl = url;
}

export function getActiveServer() {
	return activeServerUrl;
}
```

All TanStack Query fetches use `getActiveServer()` as the base URL instead of the hardcoded `VITE_API_URL`.

### 3.3 UI

Add a server selector component (lobby screen or settings):
- List from `GET /servers` with name, player count, ping
- Selecting a server calls `setActiveServer(url)`
- Persist selection to `localStorage`

---

## Phase 4 — Cloudflared install in start.sh

Extend `check_deps` and add `install_cloudflared`:

| OS | Method |
|----|--------|
| Linux (apt/deb) | Official Cloudflare .deb repo |
| Linux (rpm) | Official Cloudflare .rpm repo |
| Arch | `pacman -S cloudflared` |
| macOS | `brew install cloudflared` |
| Fallback | Download binary from GitHub releases |

---

## Implementation order

1. `master` — Drizzle migration for `servers` table
2. `master` — `/servers` endpoints (register / heartbeat / unregister / list) with rate limiting
3. `api` — `src/libs/federated.ts` (register / heartbeat / unregister)
4. `api` — `.env.example` update (`MASTER_URL`, `SERVER_NAME`)
5. `start.sh` — cloudflared startup + URL parsing + registration call
6. `start.sh` — `cloudflared` dependency check + auto-install
7. `web` — `active-server.svelte.ts` store + replace `VITE_API_URL` usages
8. `web` — server selector UI component