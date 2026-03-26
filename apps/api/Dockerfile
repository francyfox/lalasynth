# ---- build ----
FROM oven/bun:alpine AS builder
WORKDIR /repo

COPY bun.lock package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/cli/package.json ./apps/cli/
COPY packages/ui/package.json ./packages/ui/
RUN bun install --ignore-scripts
COPY apps/api ./apps/api
COPY packages ./packages

WORKDIR /repo/apps/api
RUN bun run build

# ---- runtime ----
FROM oven/bun:alpine AS runner
WORKDIR /repo

RUN apk add --no-cache \
    ffmpeg \
    yt-dlp

COPY bun.lock package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/cli/package.json ./apps/cli/
COPY packages/ui/package.json ./packages/ui/
RUN bun install --ignore-scripts
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/migrations ./apps/api/migrations
COPY apps/api/public ./apps/api/public
RUN mkdir -p /repo/apps/api/public /repo/apps/api/data /repo/apps/api/logs

WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["bun", "dist/index.js"]