# BandCheck Backend Development

This backend uses Azure Functions with TypeScript and Azure Table Storage (via Azurite for local development).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Azure Functions Core Tools (`npm install -g azure-functions-core-tools@4`)

### Local Development Setup

1. **Start Azurite (Local Azure Storage Emulator)**
   ```bash
   npm run azurite:start
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Functions Runtime**
   ```bash
   npm run dev
   ```

4. **Seed Test Data** (Optional)
   ```bash
   node scripts/seed-test-data.js
   ```

5. **Test the API**
   ```bash
   ./scripts/test-api.sh
   ```

## 📋 Available Scripts

- `npm run dev` - Start Azure Functions locally with hot reload
- `npm run azurite:start` - Start Azurite container
- `npm run azurite:stop` - Stop Azurite container
- `npm run docker:up` - Start full Docker Compose stack
- `npm run docker:down` - Stop Docker Compose stack
- `npm run build` - Build TypeScript code
- `npm run watch` - Watch TypeScript files for changes

## 🌐 API Endpoints

All endpoints run on `http://localhost:7071/api/` when developing locally.

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

### Local Development
- Uses Azurite (Azure Storage Emulator)
- Tables: `bands`, `reviews`
- Connection string in `local.settings.json`

### Production
- Uses Azure Table Storage
- Managed identity authentication
- Environment variables for configuration

## 🧪 Testing

1. **Start the services:**
   ```bash
   npm run azurite:start
   npm run dev
   ```

2. **Run API tests:**
   ```bash
   ./scripts/test-api.sh
   ```

3. **Manual testing with curl:**
   ```bash
   # Get all bands
   curl http://localhost:7071/api/bands
   
   # Get specific band
   curl http://localhost:7071/api/bands/test-band-1
   ```

## 🐳 Docker Development

You can also run everything in Docker:

```bash
# Start full stack (Azurite + Functions)
npm run docker:up

# View logs
npm run docker:logs

# Stop stack
npm run docker:down
```

## 📂 Project Structure

```
src/
├── functions/           # Azure Function endpoints
│   ├── GetBands.ts     # GET /bands
│   ├── GetBandDetails.ts # GET /bands/{id}
│   ├── SubmitBand.ts   # POST /bands
│   └── ReviewBand.ts   # POST /bands/{id}/review
└── shared/             # Shared utilities
    ├── types.ts        # TypeScript interfaces
    ├── utils.ts        # Helper functions
    └── Tables.ts       # Azure Table Storage clients
```

## 🔧 Configuration Files

- `local.settings.json` - Azure Functions local settings
- `docker-compose.yml` - Multi-container setup
- `.env` - Environment variables
- `host.json` - Azure Functions host configuration