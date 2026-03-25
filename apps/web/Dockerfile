# ---- build ----
FROM oven/bun:1.3 AS builder
WORKDIR /repo

COPY bun.lock package.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/ui/package.json ./packages/ui/
RUN bun install --frozen-lockfile

COPY apps/web ./apps/web
COPY apps/api/src ./apps/api/src
COPY packages ./packages

WORKDIR /repo/apps/web
RUN bun run build

# ---- runtime ----
FROM oven/bun:1.3-slim AS runner
WORKDIR /app

COPY --from=builder /repo/apps/web/dist ./dist
COPY --from=builder /repo/apps/web/serve.ts ./serve.ts

EXPOSE 4173
CMD ["bun", "serve.ts"]