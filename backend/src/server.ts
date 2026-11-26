import { createApiRouter } from './adapters/api/router';
import { BandServiceImpl, ReviewServiceImpl } from './core/services/band.service';
import { DrizzleBandRepository, DrizzleReviewRepository } from './adapters/database/drizzle.repository';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { client, db } from './db';

const PORT = process.env.PORT || 3000;

await migrate(db, { migrationsFolder: './drizzle/postgres' });
console.log('✅ PostgreSQL migrations applied');

const bandRepository = new DrizzleBandRepository();
const reviewRepository = new DrizzleReviewRepository();

const bandService = new BandServiceImpl(bandRepository, reviewRepository);
const reviewService = new ReviewServiceImpl(reviewRepository, bandRepository);
const handleRequest = createApiRouter(bandService, reviewService);

const server = Bun.serve({
  port: PORT,
  fetch: handleRequest,
});

console.log(`🚀 Server running at http://localhost:${server.port}`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    server.stop(true);
    await client.end({ timeout: 5 });
    process.exit(0);
  });
}
