# === Build stage: install dependencies and generate migrations ===
FROM oven/bun:1-alpine AS install
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY src/ ./src/
COPY drizzle.config.ts ./
RUN bun run db:generate

# === Release stage: distroless (no shell, no package manager) ===
FROM oven/bun:1-distroless AS release
WORKDIR /app

COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/drizzle ./drizzle
COPY package.json ./
COPY src/ ./src/
COPY drizzle.config.ts ./

# Expose port
EXPOSE 3000

# Migrations run automatically in server.ts on startup
CMD ["bun", "run", "src/server.ts"]
