# Hexagonal Architecture (Ports & Adapters)

This backend follows the **Hexagonal Architecture** (also known as Ports and Adapters) pattern for clean separation of concerns and extensibility.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Primary/Driving Side                       │
│                   (Users, HTTP, External)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRIMARY ADAPTERS                           │
│  src/adapters/api/                                           │
│  - router.ts          (HTTP routing, CORS)                   │
│  - bands.controller.ts (HTTP request/response handling)      │
│  - auth.adapter.ts    (Auth0 JWT validation)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PRIMARY PORTS                            │
│  src/core/ports/repositories.ts                              │
│  - BandService interface                                     │
│  - ReviewService interface                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CORE/DOMAIN                              │
│  src/core/                                                   │
│  - domain/entities.ts  (Band, Review, DTOs)                  │
│  - services/           (BandServiceImpl, ReviewServiceImpl)  │
│                                                              │
│  BUSINESS LOGIC - No external dependencies!                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SECONDARY PORTS                           │
│  src/core/ports/repositories.ts                              │
│  - BandRepository interface                                  │
│  - ReviewRepository interface                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SECONDARY ADAPTERS                          │
│  src/adapters/database/                                      │
│  - drizzle.repository.ts (Drizzle ORM implementation)        │
│                                                              │
│  Future: Could add MongoDB, Postgres, etc. implementations   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Systems                              │
│              (SQLite, PostgreSQL, NoSQL, etc.)               │
└─────────────────────────────────────────────────────────────┘
```

## Key Benefits

### 1. **Dependency Inversion**
- Core business logic depends only on interfaces (ports)
- No direct dependencies on frameworks or databases
- Easy to test with mocks

### 2. **Pluggable Adapters**
- Swap Drizzle for MongoDB without touching business logic
- Add GraphQL API alongside REST without modifying services
- Switch from Auth0 to another provider by replacing adapter

### 3. **Clear Separation**
```typescript
// BAD (before): Service depends on ORM directly
import { db, bands } from '../db';
export function getAllBands() {
  return db.select().from(bands).all();
}

// GOOD (now): Service depends on interface
interface BandRepository {
  findAll(query: GetBandsQuery): Promise<GetBandsResult>;
}
export class BandService {
  constructor(private repo: BandRepository) {}
  getAllBands(query: GetBandsQuery) {
    return this.repo.findAll(query);
  }
}
```

## Directory Structure

```
src/
├── server.ts                    # Entry point, dependency injection
├── core/                        # Business logic (framework-agnostic)
│   ├── domain/
│   │   └── entities.ts          # Domain models, DTOs, types
│   ├── ports/
│   │   └── repositories.ts      # Port interfaces
│   └── services/
│       └── band.service.ts      # Use cases, business rules
├── adapters/                    # External world implementations
│   ├── api/                     # Primary/Driving adapters
│   │   ├── router.ts            # HTTP routing
│   │   ├── bands.controller.ts  # HTTP handlers
│   │   └── auth.adapter.ts      # Auth0 integration
│   └── database/                # Secondary/Driven adapters
│       └── drizzle.repository.ts # Drizzle ORM implementation
└── db/                          # Database schema (SQLite-specific)
    ├── index.ts
    └── schema.ts
```

## Dependency Injection (server.ts)

```typescript
// 1. Initialize adapters
const bandRepo = new DrizzleBandRepository();
const reviewRepo = new DrizzleReviewRepository();

// 2. Inject into core services
const bandService = new BandServiceImpl(bandRepo, reviewRepo);
const reviewService = new ReviewServiceImpl(reviewRepo, bandRepo);

// 3. Inject into API router
const handleRequest = createApiRouter(bandService, reviewService);
```

## How to Add a New Adapter

### Example: Adding MongoDB Support

1. **Install dependencies**
   ```bash
   bun add mongodb
   ```

2. **Create MongoDB adapter**
   ```typescript
   // src/adapters/database/mongodb.repository.ts
   import { MongoClient } from 'mongodb';
   import type { BandRepository } from '../../core/ports/repositories';
   
   export class MongoBandRepository implements BandRepository {
     constructor(private client: MongoClient) {}
     
     async findAll(query: GetBandsQuery) {
       const collection = this.client.db().collection('bands');
       // MongoDB-specific query logic
     }
   }
   ```

3. **Update server.ts**
   ```typescript
   // Choose implementation at startup
   const useMongo = process.env.USE_MONGODB === 'true';
   const bandRepo = useMongo 
     ? new MongoBandRepository(mongoClient)
     : new DrizzleBandRepository();
   ```

### Example: Adding GraphQL API

1. **Create GraphQL adapter**
   ```typescript
   // src/adapters/api/graphql.adapter.ts
   import { buildSchema } from 'graphql';
   
   export function createGraphQLHandler(
     bandService: BandServiceImpl,
     reviewService: ReviewServiceImpl
   ) {
     // GraphQL implementation using same services
   }
   ```

2. **Add to router**
   ```typescript
   if (url.pathname === '/graphql') {
     return graphqlHandler(req);
   }
   ```

## Testing

### Unit Testing Core Services
```typescript
// Mock repository for testing
class MockBandRepository implements BandRepository {
  async findAll() { return { bands: [], total: 0 }; }
  async findById() { return null; }
  // ...
}

const service = new BandServiceImpl(mockBandRepo, mockReviewRepo);
// Test pure business logic without database
```

### Integration Testing
```typescript
// Use real Drizzle adapter with test database
const testRepo = new DrizzleBandRepository();
const service = new BandServiceImpl(testRepo, testReviewRepo);
// Test actual database interactions
```

## Migration Path

If you want to switch from SQLite to PostgreSQL:

1. **Option A: Use Drizzle's PostgreSQL driver**
   - Keep using `DrizzleBandRepository`
   - Just change connection in `db/index.ts`
   - Schema changes handled by Drizzle migrations

2. **Option B: Create new PostgreSQL adapter**
   - Create `PostgresBandRepository`
   - Implement same `BandRepository` interface
   - Switch in `server.ts` dependency injection

Core services remain untouched in both cases! ✨
