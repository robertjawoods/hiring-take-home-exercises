/// <reference types="node" />

import { defineConfig } from "prisma/config";

// Load the repo-root .env (DATABASE_URL) for CLI commands.
try {
  process.loadEnvFile(new URL("../../.env", import.meta.url));
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
