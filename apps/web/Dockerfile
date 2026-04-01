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
RUN bun run build

# ---- runtime ----
FROM nginx:alpine
COPY --from=builder /repo/apps/web/dist/client /usr/share/nginx/html
RUN printf 'server {\n    listen 80;\n    root /usr/share/nginx/html;\n    index index.html;\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
