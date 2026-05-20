#!/usr/bin/env sh
set -e

# Start the server (migrations run automatically on startup via server.ts)
exec bun run src/server.ts
