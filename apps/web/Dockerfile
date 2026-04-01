# ---- build ----
FROM oven/bun:alpine AS builder
WORKDIR /repo

COPY bun.lock package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/cli/package.json ./apps/cli/
COPY packages/ui/package.json ./packages/ui/
RUN bun install --ignore-scripts
COPY apps/web ./apps/web
COPY apps/api/src ./apps/api/src
COPY packages ./packages

WORKDIR /repo/apps/web
RUN bun run build

# ---- runtime ----
FROM caddy:2-alpine
COPY --from=builder /repo/apps/web/dist/client /srv
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
