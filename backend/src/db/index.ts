import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set to connect to PostgreSQL');
}

export const client = postgres(databaseUrl, {
  max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export * from './schema';
