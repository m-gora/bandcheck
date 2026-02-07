import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || './data/bandcheck.db';

// Create database connection using Bun's built-in SQLite
const sqlite = new Database(DATABASE_URL, { create: true });

export const db = drizzle(sqlite, { schema });

export * from './schema';
