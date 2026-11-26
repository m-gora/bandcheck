# === Build stage: install dependencies ===
FROM oven/bun:1-alpine AS install
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# === Release stage: distroless (no shell, no package manager) ===
FROM oven/bun:1-distroless AS release
WORKDIR /app

COPY --from=install /app/node_modules ./node_modules
COPY drizzle/postgres/ ./drizzle/postgres/
COPY package.json ./
COPY src/ ./src/

# Expose port
EXPOSE 3000

# Migrations run automatically in server.ts on startup
CMD ["src/server.ts"]
