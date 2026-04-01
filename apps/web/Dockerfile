# ---- build ----
FROM oven/bun:1.3.10-alpine AS builder
WORKDIR /repo

COPY bun.lock package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/master/package.json ./apps/master/
COPY apps/web/package.json ./apps/web/
COPY apps/cli/package.json ./apps/cli/
COPY packages/ui/package.json ./packages/ui/
RUN bun install --ignore-scripts
COPY apps/web ./apps/web
COPY apps/api/src ./apps/api/src
COPY packages ./packages

WORKDIR /repo/apps/web

ARG VITE_API_URL
ARG VITE_MASTER_URL
ARG VITE_APP_VERSION
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MASTER_URL=$VITE_MASTER_URL
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN bun run build

# ---- runtime ----
FROM nginx:alpine
COPY --from=builder /repo/apps/web/dist/client /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
