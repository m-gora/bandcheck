#!/usr/bin/env sh
set -e

# Initialize database schema if database doesn't exist
if [ ! -f /app/data/bandcheck.db ]; then
  echo "Initializing database schema..."
  bun run db:push
fi

# Start the server
exec bun run src/server.ts
