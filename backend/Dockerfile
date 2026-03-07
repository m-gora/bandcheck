# Build stage - install dependencies
FROM oven/bun:1 AS install
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Production stage - distroless
FROM oven/bun:1-distroless
WORKDIR /app

# Copy dependencies and source
COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/
COPY drizzle/ ./drizzle/
COPY drizzle.config.ts ./

# Create data directory
# Note: distroless runs as nonroot (uid 65534) by default
VOLUME ["/app/data"]

EXPOSE 3000

ENTRYPOINT ["bun", "run", "src/server.ts"]
