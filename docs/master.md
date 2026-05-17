# Master Server List — Implementation Plan

## Обзор

Когда игрок запускает `apps/api` на своей машине:
1. Запускается Cloudflare tunnel — локальный сервер получает публичный URL
2. API регистрируется на `apps/master` с этим URL
3. API отправляет хартбиты с количеством игроков каждые 30 сек

`apps/web` получает список серверов в реальном времени через WebSocket к master.
После авторизации пользователь выбирает сервер — его URL сохраняется на клиенте
и заменяет статичный `VITE_API_URL` для всех последующих API-запросов.

## Схема взаимодействия

```
Машина игрока:
  apps/api (port 3000)
      └── cloudflared → https://xxxx.trycloudflare.com
              │
              ├── POST /servers/register  (на старте)
              ├── POST /servers/:id/heartbeat  (каждые 30с)
              └── DELETE /servers/:id  (при shutdown)

Облако:
  apps/master (port 5000)
      ├── POST   /servers/register
      ├── POST   /servers/:id/heartbeat
      ├── DELETE /servers/:id
      ├── GET    /servers
      └── WS     /servers/ws  ──→  broadcast всем web-клиентам

Браузер:
  apps/web
      ├── WS → master /servers/ws  (real-time список)
      ├── /servers  (новый роут — выбор сервера после auth)
      └── activeServer store → динамический URL для API-клиента
```

---

## 1. Cloudflare Tunnel (apps/api)

### Пакет, не системная утилита

Используем npm-пакет [`cloudflared`](https://www.npmjs.com/package/cloudflared) — он сам скачивает бинарник при первом запуске, пользователю ничего устанавливать не нужно. **Уже подключён** в `apps/api/src/libs/cloudflared.ts`.

### Текущее состояние

`startCloudflaredTunnel()` уже реализована и вызывается в `src/index.ts` при старте. Сейчас работает **только named tunnel** через `CLOUDFLARED_TOKEN`. Нужно добавить:
- Quick tunnel режим (когда токен не задан) — даёт рандомный `*.trycloudflare.com` URL
- После получения URL — регистрация на master

### Два режима

| Режим | Условие | Результат |
|-------|---------|-----------|
| Named tunnel | `CLOUDFLARED_TOKEN` задан | Постоянный URL через CF Dashboard |
| Quick tunnel | `CLOUDFLARED_TOKEN` не задан | Рандомный `*.trycloudflare.com` URL |

```ts
// Named tunnel (уже реализован)
const tunnel = Tunnel.withToken(env.CLOUDFLARED_TOKEN);

// Quick tunnel (нужно добавить)
const tunnel = new Tunnel({ port: env.PORT });
await tunnel.start();
// URL получаем из ConfigHandler или tunnel.url
```

### Новые env vars (apps/api)

```env
MASTER_URL=https://lala-master.shalotts.site  # куда регистрироваться
CF_TUNNEL_TOKEN=                               # опционально: токен именного туннеля
SERVER_NAME=                                   # опционально: имя сервера (default: hostname)
MAX_PLAYERS=8                                  # опционально (default: 8)
```

---

## 2. Протокол регистрации (apps/api → apps/master)

### Register (POST /servers/register)

```ts
// Request
{
  name: string,      // SERVER_NAME или os.hostname()
  url: string,       // tunnel URL
  version: string,   // версия apps/api
  maxPlayers: number
}

// Response
{ id: string }  // cuid2 — достаточно как идентификатор
```

### Heartbeat (POST /servers/:id/heartbeat)

```ts
// Request
{
  playerCount: number,
  status: "idle" | "playing"
}
```

### Unregister (DELETE /servers/:id)

```ts
// Вызывается при SIGINT/SIGTERM в apps/api
```

### Логика на стороне API

```
startup:
  1. start cloudflared → parse tunnel URL (timeout 30s)
  2. POST /servers/register → сохранить { id, secret }
  3. setInterval(heartbeat, 30_000)

shutdown (SIGINT/SIGTERM):
  1. clearInterval(heartbeat)
  2. DELETE /servers/:id
  3. kill cloudflared
```

---

## 3. apps/master — изменения

### Новая таблица `game_servers` (Drizzle)

```ts
export const gameServers = sqliteTable("game_servers", {
  id: text("id").$defaultFn(() => createId()).primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  version: text("version").notNull(),
  playerCount: integer("player_count").notNull().default(0),
  maxPlayers: integer("max_players").notNull().default(8),
  status: text("status", { enum: ["idle", "playing", "offline"] })
    .notNull().default("idle"),
  registeredAt: integer("registered_at", { mode: "timestamp" }).notNull(),
  lastHeartbeatAt: integer("last_heartbeat_at", { mode: "timestamp" }).notNull(),
});
```

### Новый модуль `modules/server/`

```
modules/server/
  server.controller.ts   — Elysia routes + встроенный .ws() для /servers/ws
  server.service.ts      — бизнес-логика
  server.schema.ts       — Drizzle schema + Zod validators
```

WebSocket через Elysia `.ws()` — никаких доп. пакетов. Broadcaster — просто Set подключённых ws-контекстов внутри controller.

### Новые роуты (Elysia)

```ts
POST   /servers/register       — публичный, rate-limit
POST   /servers/:id/heartbeat  — Bearer secret
DELETE /servers/:id            — Bearer secret
GET    /servers                — публичный, возвращает online-серверы
WS     /servers/ws             — публичный WebSocket
```

### WebSocket на master (`WS /servers/ws`)

Elysia имеет встроенный `.ws()`. Хранит Set подключённых клиентов. При любом изменении списка (register/heartbeat/unregister/cleanup) — broadcast всем:

```ts
// При подключении — сразу текущий список
ws.send({ type: "servers", data: await getActiveServers() })

// При любом изменении
broadcast({ type: "servers", data: await getActiveServers() })
```

Формат сообщения всегда полный снэпшот (не дельта) — проще на клиенте, список небольшой.

### Динамический CORS на apps/api

API сервер запускается на машине игрока — он не знает заранее URL веб-приложения. Поскольку авторизация полностью на master (нет cookies/сессий на api), api может разрешить любой origin:

```ts
cors({
  origin: true, // разрешить все — безопасно, т.к. auth не на api
})
```

Или получать разрешённый origin от master при регистрации и подставлять динамически.

### Очистка

- Стартует на старте master: `setInterval` каждые 60с
- Помечает `status: "offline"` если `lastHeartbeatAt` > 90с назад
- Удаляет из БД если offline > 10 минут

---

## 4. apps/web — изменения

### Динамический API URL

Сейчас `client` в `lib/api.ts` создаётся с `env.VITE_API_URL` (build-time).
Нужно переделать на runtime-значение из store.

```ts
// lib/stores/active-server.svelte.ts
type ActiveServer = { id: string; name: string; url: string } | null;

function createActiveServerStore() {
  const persisted = localStorage.getItem("activeServer");
  let server = $state<ActiveServer>(persisted ? JSON.parse(persisted) : null);

  return {
    get current() { return server; },
    set(s: ActiveServer) {
      server = s;
      localStorage.setItem("activeServer", JSON.stringify(s));
    },
    clear() {
      server = null;
      localStorage.removeItem("activeServer");
    },
  };
}

export const activeServer = createActiveServerStore();
```

```ts
// lib/api.ts — клиент становится функцией или используем baseUrl getter
export function getClient() {
  return createClient<paths>({
    baseUrl: activeServer.current?.url ?? env.VITE_API_URL,
  });
}
```

> **Альтернатива**: держать один инстанс `client` и менять `baseUrl` через middleware.
> Нужно проверить, поддерживает ли `openapi-fetch` динамический baseUrl.

### Новый WebSocket store (`lib/stores/servers.svelte.ts`)

`@elysiajs/eden` уже установлен — даёт type-safe WS подписку из типов master:

```ts
import { treaty } from "@elysiajs/eden";
import type { AppRoutes } from "@app/master";

const api = treaty<AppRoutes>(VITE_MASTER_URL);
const { data, error } = api.servers.ws.subscribe();
// data реактивно обновляется при каждом broadcast от master
```

Реконнект — стандартный паттерн с exponential backoff через `$effect`.

### Новый роут `/servers`

- За `authGuard` — неавторизованные туда не попадают
- Если `activeServer` уже выбран → редирект на `/lobby`
- Показывает карточки серверов из WebSocket store
- Каждая карточка: имя, игроки (N/Max), статус-бейдж (online/playing/offline)
- "Подключиться" → устанавливает `activeServer` → redirect на `/lobby`
- Кнопка "Сменить сервер" в лобби → очищает `activeServer` → redirect на `/servers`

### Guard: serverGuard

```ts
// lib/guards/server.guard.ts
// Порядок проверок: сначала authGuard, потом serverGuard
// serverGuard: activeServer !== null, иначе redirect → /servers
// Вешается на /lobby и /game
```

---

## 5. Порядок реализации

1. **apps/master**: миграция — новая таблица `game_servers`
2. **apps/master**: `server.schema.ts` + `server.service.ts`
3. **apps/master**: REST endpoints (register / heartbeat / unregister / GET)
4. **apps/master**: WebSocket `/servers/ws` + broadcaster
5. **apps/master**: `bun run schema` → обновить `type.d.ts`
6. **apps/api**: env vars (`MASTER_URL`, `CF_TUNNEL_TOKEN`, `SERVER_NAME`, `MAX_PLAYERS`)
7. **apps/api**: cloudflared tunnel startup + parse URL + авто-установка
8. **apps/api**: модуль регистрации (register → heartbeat loop → unregister on shutdown)
9. **apps/web**: `activeServer` store + динамический `client`
10. **apps/web**: `servers.svelte.ts` WebSocket store
11. **apps/web**: роут `/servers` + UI карточек
12. **apps/web**: `serverGuard` на `/lobby` и `/game`

---

## Открытые вопросы

- **`openapi-fetch` динамический baseUrl**: можно ли менять `baseUrl` без пересоздания клиента? Нужно проверить middleware API.
- **Ping на клиенте**: показывать latency до сервера? Можно через `HEAD /health` с замером времени.
