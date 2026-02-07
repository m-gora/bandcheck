# Backend Container Build & Deploy

This directory contains the CI/CD pipeline for building and deploying the bandcheck backend container.

## GitHub Container Registry

Images are automatically built and pushed to GitHub Container Registry (ghcr.io) on:
- Push to `main` or `dev` branches
- Pull requests (built but not pushed)
- Version tags (e.g., `v1.0.0`)
- Manual workflow dispatch

### Image Tags

Images are tagged as follows:
- `latest` - Latest build from `main` branch
- `main` - Latest build from `main` branch
- `dev` - Latest build from `dev` branch
- `v1.0.0` - Semver tags (from git tags)
- `main-sha-abc123` - Branch + commit SHA
- `pr-42` - Pull request builds

### Pulling the Image

```bash
# Pull latest
docker pull ghcr.io/marcodoes/bandcheck/backend:latest

# Pull specific version
docker pull ghcr.io/marcodoes/bandcheck/backend:v1.0.0

# Pull from dev branch
docker pull ghcr.io/marcodoes/bandcheck/backend:dev
```

## Local Development

### Build Locally

```bash
# From backend directory
docker build -t bandcheck-backend:local .

# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t bandcheck-backend:local .
```

### Run Locally

```bash
# Run with environment variables
docker run -p 3000:3000 \
  -e AUTH0_DOMAIN=auth.marcodoes.tech \
  -e AUTH0_AUDIENCE=https://api.bandcheck.marcodoes.tech \
  -e PORT=3000 \
  -e DATABASE_URL=./data/bandcheck.db \
  -e ALLOWED_ORIGINS=http://localhost:5173,https://bandcheck.marcodoes.tech \
  ghcr.io/marcodoes/bandcheck/backend:latest

# Or with .env file
docker run -p 3000:3000 --env-file .env ghcr.io/marcodoes/bandcheck/backend:latest
```

### Run with Docker Compose

```bash
# Run backend with Azurite (Azure Storage emulator)
docker-compose up
```

## Kubernetes Deployment

Update the K8s deployment to use the built image:

```yaml
# k8s/deployment.yaml
spec:
  containers:
    - name: backend
      image: ghcr.io/marcodoes/bandcheck/backend:latest
      # Or pin to specific version
      # image: ghcr.io/marcodoes/bandcheck/backend:v1.0.0
```

Deploy:

```bash
# Update to latest
kubectl set image deployment/bandcheck-backend \
  backend=ghcr.io/marcodoes/bandcheck/backend:latest \
  -n bandcheck

# Or apply full manifest
kubectl apply -f k8s/
```

## CI/CD Workflow

The build pipeline ([.github/workflows/backend-build.yml](../.github/workflows/backend-build.yml)) performs:

1. **Checkout** - Fetches repository code
2. **Setup Docker Buildx** - Enables multi-platform builds
3. **Login to GHCR** - Authenticates using `GITHUB_TOKEN`
4. **Extract Metadata** - Generates tags and labels
5. **Build & Push** - Builds for amd64 and arm64, pushes to registry

### Manual Trigger

You can manually trigger a build from GitHub:
1. Go to Actions tab
2. Select "Build and Push Backend"
3. Click "Run workflow"
4. Choose branch and run

### Creating a Release

```bash
# Tag a new version
git tag v1.0.0
git push origin v1.0.0

# This will trigger a build with tags:
# - ghcr.io/marcodoes/bandcheck/backend:v1.0.0
# - ghcr.io/marcodoes/bandcheck/backend:v1.0
# - ghcr.io/marcodoes/bandcheck/backend:v1
# - ghcr.io/marcodoes/bandcheck/backend:latest (if on main)
```

## Image Details

**Base Image:** `oven/bun:1`
**Platforms:** linux/amd64, linux/arm64
**Exposed Port:** 3000
**User:** Non-root (`bun` user)
**Size:** ~150MB (compressed)

## Required Environment Variables

The container requires these environment variables:

```bash
AUTH0_DOMAIN=auth.marcodoes.tech
AUTH0_AUDIENCE=https://api.bandcheck.marcodoes.tech
PORT=3000
DATABASE_URL=./data/bandcheck.db
ALLOWED_ORIGINS=http://localhost:5173,https://bandcheck.marcodoes.tech
```

See [k8s/secrets-template.yaml](k8s/secrets-template.yaml) for Kubernetes secret configuration.

## Troubleshooting

### Image not found
Make sure the repository allows public access or you're authenticated:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Build failing
Check the GitHub Actions logs:
1. Go to repository → Actions tab
2. Click on the failed workflow run
3. Expand job steps to see error details

### Database persistence
Mount a volume for the SQLite database:
```bash
docker run -v $(pwd)/data:/app/data -p 3000:3000 \
  -e DATABASE_URL=/app/data/bandcheck.db \
  ghcr.io/marcodoes/bandcheck/backend:latest
```
