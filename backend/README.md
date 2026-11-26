# BandCheck Backend Development

The backend is a Bun/TypeScript HTTP API. It uses Drizzle ORM with PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Bun 1.x
- PostgreSQL, with a `bandcheck` database and user

### Local Development Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Configure the database**

   Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL URL.
   The application applies Drizzle migrations at startup.

3. **Start the API**
   ```bash
   bun run dev
   ```

## 📋 Available Scripts

- `bun run dev` - Start the API with hot reload
- `bun run start` - Start the API
- `bun run db:generate` - Generate PostgreSQL migrations from the schema
- `bun run db:migrate` - Apply migrations
- `bun run lint` - Lint the backend source
- `bun run type-check` - Type-check the backend

## 🌐 API Endpoints

API endpoints run on `http://localhost:3000/api/` during local development.

### Public Endpoints

#### GET `/bands`
Retrieve all bands with optional filtering
- Query params: `search`, `genre`, `limit`, `offset`

#### GET `/bands/{bandId}`
Get specific band details with reviews

### Authenticated Endpoints

#### POST `/bands` 
Submit a new band (requires authentication)
```json
{
  "name": "Band Name",
  "description": "Band description",
  "genres": ["Genre1", "Genre2"],
  "location": "City, Country",
  "formed": "2020",
  "website": "https://example.com",
  "members": ["Member 1", "Member 2"]
}
```

#### POST `/bands/{bandId}/reviews`
Submit a safety review for a band (requires authentication)
```json
{
  "safetyAssessment": "safe|unsafe|controversial",
  "comment": "Review text",
  "evidence": ["Evidence 1", "Evidence 2"]
}
```

### Moderator Endpoints

The following endpoints require a user with `moderator` or `admin` role:

#### PATCH `/bands/{bandId}`
Update band information (moderator only)
```json
{
  "name": "Updated Band Name",
  "description": "Updated description",
  "safetyStatus": "safe|unsafe|controversial|pending"
}
```

#### DELETE `/bands/{bandId}`
Delete a band and all its reviews (moderator only)

#### DELETE `/bands/{bandId}/reviews/{reviewId}`
Delete a specific review (moderator only)

## 🔐 Authentication & Authorization

### Setting up Auth0 Roles

1. **Create Roles in Auth0:**
   - Go to User Management → Roles in Auth0 Dashboard
   - Create a role called `moderator`
   - Optionally create an `admin` role for higher privileges

2. **Add Roles to JWT Token:**
   - Go to Actions → Flows → Login
   - Create a new Action with this code:
   ```javascript
   exports.onExecutePostLogin = async (event, api) => {
     const namespace = 'https://your-app.com';
     if (event.authorization) {
       api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
       api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
     }
   };
   ```
   - Deploy and add it to your Login flow

3. **Assign Roles to Users:**
   - Go to User Management → Users
   - Select a user and assign the `moderator` role

4. **Configure Environment Variables:**
   ```bash
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_AUDIENCE=your-api-identifier
   ```

### Authorization Flow

- **Public endpoints** - No authentication required
- **Authenticated endpoints** - Valid JWT token required
- **Moderator endpoints** - Valid JWT token + `moderator` or `admin` role required

The backend checks for roles in the JWT token under the `roles` claim. Make sure your Auth0 configuration adds roles to the access token.

## 🗃️ Data Storage

PostgreSQL stores the `bands` and `reviews` tables. The connection URL is
provided through `DATABASE_URL`; Kubernetes supplies it from a SOPS-encrypted
Secret. Drizzle migrations run before the HTTP server starts.

### Importing the crawler snapshot

The crawler snapshot stays local; the import tool streams it into PostgreSQL
and stores the full source record in `bands.source_metadata`. The public API
does not expose that metadata. `ma_id` is the idempotency key, so rerunning a
partial import skips records already present.

First run the dry-run report:

```bash
bun run db:import-crawler
```

The PostgreSQL migration adds a partial unique index on `ma_id` and a
`source_metadata` JSONB column. Apply migrations first. To connect from the
workstation, keep this port-forward running in one terminal:

```bash
kubectl -n postgres port-forward svc/postgres-rw 15432:5432
```

In another terminal, set `DATABASE_URL` to the same credentials with host
`127.0.0.1` and port `15432`, then apply migrations and try a small batch:

```bash
bun run db:migrate
bun run db:import-crawler -- --apply --limit=100
```

After validating the inserted rows, run without `--limit` to import the full
file. The tool commits batches of 500 by default; `--batch-size=N` adjusts that.

## 🧪 Testing

Smoke-test the API with:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/bands
```

## 🐳 Docker Development

Build and run the API container with a reachable PostgreSQL instance:

```bash
docker build -t bandcheck-backend .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  bandcheck-backend
```

## 📂 Project Structure

```
src/
├── adapters/           # HTTP API and PostgreSQL repository
├── core/               # Domain entities, ports, and services
└── db/                 # Drizzle PostgreSQL schema and connection
```

## 🔧 Configuration Files

- `.env` - Local runtime configuration (`DATABASE_URL`, Auth0, Turnstile)
- `drizzle.config.ts` - PostgreSQL migration configuration
