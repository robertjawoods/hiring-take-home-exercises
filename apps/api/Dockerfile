# Build context is the repo root (pnpm workspace), not apps/api.
FROM node:22-alpine

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
COPY seed seed

RUN pnpm --filter database db:generate

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["pnpm", "start"]
