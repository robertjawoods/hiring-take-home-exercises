# Build context is the repo root (pnpm workspace), not apps/web.
FROM node:22-alpine AS builder

RUN apk add --no-cache openssl libc6-compat
RUN corepack enable

WORKDIR /app

# Install deps first for layer caching: only the package manifests.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json

RUN pnpm install --frozen-lockfile

COPY packages/database packages/database
COPY apps/api apps/api
COPY apps/web apps/web

RUN pnpm --filter database db:generate
RUN pnpm --filter web build

FROM node:22-alpine

RUN corepack enable
WORKDIR /app

COPY --from=builder /app /app
WORKDIR /app/apps/web

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "build/index.js"]
