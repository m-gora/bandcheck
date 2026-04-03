import { createApiRouter } from './adapters/api/router';
import { BandServiceImpl, ReviewServiceImpl } from './core/services/band.service';
import { DrizzleBandRepository, DrizzleReviewRepository } from './adapters/database/drizzle.repository';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db } from './db';

// Run migrations on startup
migrate(db, { migrationsFolder: './drizzle' });

const PORT = process.env.PORT || 3000;

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
