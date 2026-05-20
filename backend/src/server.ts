import { createApiRouter } from './adapters/api/router';
import { BandServiceImpl, ReviewServiceImpl } from './core/services/band.service';
import { DrizzleBandRepository, DrizzleReviewRepository } from './adapters/database/drizzle.repository';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db, sqlite } from './db';
import crypto from 'node:crypto';
import fs from 'node:fs';

const PORT = process.env.PORT || 3000;

// If the database was previously bootstrapped via db:push (no migration tracking),
// record all existing migrations so migrate() doesn't try to re-apply them.
function bootstrapMigrationsIfNeeded(migrationsFolder: string) {
  const bandsExists = sqlite.query("SELECT 1 FROM sqlite_master WHERE type='table' AND name='bands'").get();
  if (!bandsExists) return;

  sqlite.run(
    'CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT NOT NULL, created_at NUMERIC)'
  );

  const alreadyTracked = sqlite.query('SELECT id FROM __drizzle_migrations LIMIT 1').get();
  if (alreadyTracked) return;

  const journal = JSON.parse(fs.readFileSync(`${migrationsFolder}/meta/_journal.json`, 'utf8'));
  const insert = sqlite.prepare('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)');
  for (const entry of journal.entries) {
    const sqlContent = fs.readFileSync(`${migrationsFolder}/${entry.tag}.sql`, 'utf8');
    const hash = crypto.createHash('sha256').update(sqlContent).digest('hex');
    insert.run(hash, entry.when);
  }
  console.log('✅ Migration tracking bootstrapped for existing database');
}

bootstrapMigrationsIfNeeded('./drizzle');

// Run migrations on startup
migrate(db, { migrationsFolder: './drizzle' });
console.log('✅ Database migrations applied');

// Initialize repositories (driven/secondary adapters)
const bandRepository = new DrizzleBandRepository();
const reviewRepository = new DrizzleReviewRepository();

// Initialize services (core business logic)
const bandService = new BandServiceImpl(bandRepository, reviewRepository);
const reviewService = new ReviewServiceImpl(reviewRepository, bandRepository);

// Create API router (driving/primary adapter)
const handleRequest = createApiRouter(bandService, reviewService);

// Start server
const _server = Bun.serve({
  port: PORT,
  fetch: handleRequest,
});

console.log(`🚀 Server running at http://localhost:${PORT}`);
