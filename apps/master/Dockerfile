# ---- build ----
FROM oven/bun:1.3.10-alpine AS builder
WORKDIR /repo

COPY bun.lock package.json turbo.json ./
COPY apps/master/package.json ./apps/master/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/cli/package.json ./apps/cli/
COPY packages/ui/package.json ./packages/ui/
RUN bun install --ignore-scripts
COPY apps/master ./apps/master
COPY packages ./packages

WORKDIR /repo/apps/master
RUN bun run build

# ---- runtime ----
FROM oven/bun:1.3.10-alpine AS runner
WORKDIR /repo

COPY bun.lock package.json ./
COPY apps/master/package.json ./apps/master/
RUN bun install --ignore-scripts
COPY --from=builder /repo/apps/master/dist ./apps/master/dist
COPY --from=builder /repo/apps/master/migrations ./apps/master/migrations
RUN mkdir -p /repo/apps/master/data /repo/apps/master/logs

WORKDIR /repo/apps/master
EXPOSE 5000
CMD ["bun", "dist/index.js"]