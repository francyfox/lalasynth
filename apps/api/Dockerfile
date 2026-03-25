# ---- build ----
FROM oven/bun:1.3 AS builder
WORKDIR /repo

COPY bun.lock package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ui/package.json ./packages/ui/
RUN bun install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages ./packages

WORKDIR /repo/apps/api
RUN bun run build

# ---- runtime ----
FROM oven/bun:1.3 AS runner
WORKDIR /repo

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    && pip3 install --break-system-packages yt-dlp \
    && rm -rf /var/lib/apt/lists/*

COPY bun.lock package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ui/package.json ./packages/ui/
RUN bun install --production --frozen-lockfile

COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/migrations ./apps/api/migrations
RUN mkdir -p /repo/apps/api/public

WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["bun", "dist/index.js"]