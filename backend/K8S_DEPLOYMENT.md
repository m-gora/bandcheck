# BandCheck Backend - Kubernetes Deployment

Backend API server for BandCheck running on Bun in Kubernetes.

## Quick Links

- **Container Registry**: [ghcr.io/marcodoes/bandcheck/backend](https://github.com/marcodoes/bandcheck/pkgs/container/bandcheck%2Fbackend)
- **GitHub Actions**: [Build Pipeline](../.github/workflows/backend-build.yml)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Container Docs**: [CONTAINER.md](CONTAINER.md)

## Local Development

```bash
# Install dependencies
bun install

# Run in development mode with hot reload
bun dev

# Run in production mode
bun start
```

## Docker

The backend image is automatically built and pushed to GitHub Container Registry on every commit to `main` or `dev` branches.

```bash
# Pull from GitHub Container Registry
docker pull ghcr.io/marcodoes/bandcheck/backend:latest

# Run locally
docker run -p 3000:3000 \
  -e AUTH0_DOMAIN=auth.marcodoes.tech \
  -e AUTH0_AUDIENCE=https://api.bandcheck.marcodoes.tech \
  -e DATABASE_URL=/app/data/bandcheck.db \
  -e ALLOWED_ORIGINS=http://localhost:5173 \
  -v $(pwd)/data:/app/data \
  ghcr.io/marcodoes/bandcheck/backend:latest

# Build locally (if needed)
docker build -t bandcheck-backend:local .
```

See [CONTAINER.md](CONTAINER.md) for detailed container documentation.

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster with kubectl configured (K3s recommended)
- NGINX Ingress Controller installed
- cert-manager for TLS certificates (optional)
- Storage provisioner for PersistentVolumes (K3s includes local-path by default)

### Setup

1. **Create namespace:**

```bash
kubectl apply -f k8s/namespace.yaml
```

2. **Create secrets:**

```bash
kubectl create secret generic bandcheck-secrets \
  --namespace bandcheck \
  --from-literal=auth0-domain="auth.marcodoes.tech" \
  --from-literal=auth0-audience="https://api.bandcheck.marcodoes.tech"
```

3. **Create PersistentVolumeClaim for SQLite database:**

```bash
kubectl apply -f k8s/pvc.yaml
```

4. **Deploy application:**

```bash
# Apply all manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

5. **Verify deployment:**

```bash
# Check pods
kubectl get pods -n bandcheck

# Check service
kubectl get svc -n bandcheck

# Check ingress
kubectl get ingress -n bandcheck

# Check PVC
kubectl get pvc -n bandcheck

# View logs
kubectl logs -f deployment/bandcheck-backend -n bandcheck
```

### Update Deployment

Images are automatically built and pushed to GitHub Container Registry on every commit.

```bash
# Update to latest image
kubectl rollout restart deployment/bandcheck-backend -n bandcheck

# Or update to specific version
kubectl set image deployment/bandcheck-backend \
  backend=ghcr.io/marcodoes/bandcheck/backend:v1.0.0 \
  -n bandcheck

# Watch rollout status
kubectl rollout status deployment/bandcheck-backend -n bandcheck
```

### Scaling

```bash
# Scale to 3 replicas
kubectl scale deployment/bandcheck-backend --replicas=3 -n bandcheck

# Auto-scaling (optional)
kubectl autoscale deployment bandcheck-backend \
  --min=2 --max=5 --cpu-percent=80 -n bandcheck
```

## Environment Variables

Required environment variables:

**Secrets (from k8s/secrets-template.yaml):**
- `AUTH0_DOMAIN` - Auth0 domain (e.g., auth.marcodoes.tech)
- `AUTH0_AUDIENCE` - Auth0 API audience (e.g., https://api.bandcheck.marcodoes.tech)

**ConfigMap / Deployment:**
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - SQLite database path (default: /app/data/bandcheck.db)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `NODE_ENV` - Environment (production/development)

## Database Management

The SQLite database is stored on a PersistentVolume. To backup or restore:

```bash
# Backup database
kubectl exec -n bandcheck deployment/bandcheck-backend -- \
  cat /app/data/bandcheck.db > backup.db

# Copy database from pod
kubectl cp bandcheck/$(kubectl get pod -n bandcheck -l app=bandcheck-backend -o jsonpath='{.items[0].metadata.name}'):/app/data/bandcheck.db ./backup.db

# Restore database (stop deployment first)
kubectl scale deployment/bandcheck-backend --replicas=0 -n bandcheck
kubectl cp ./backup.db bandcheck/$(kubectl get pod -n bandcheck -l app=bandcheck-backend -o jsonpath='{.items[0].metadata.name}'):/app/data/bandcheck.db
kubectl scale deployment/bandcheck-backend --replicas=2 -n bandcheck
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/bands` - List all bands (with optional search/genre filters)
- `GET /api/bands/:id` - Get band details with reviews
- `POST /api/bands` - Submit a new band (requires authentication)
- `POST /api/bands/:id/reviews` - Submit a review (requires authentication)

## CI/CD Pipeline

The backend uses GitHub Actions for continuous deployment:

1. **On commit to `main` or `dev`**: Automatically builds and pushes Docker image
2. **On version tag** (e.g., `v1.0.0`): Creates versioned release
3. **On pull request**: Builds but doesn't push (validation only)

To trigger a deployment:
```bash
# Commit to main branch
git push origin main

# Or create a version tag
git tag v1.0.0
git push origin v1.0.0

# Manual workflow trigger
# Go to GitHub Actions → "Build and Push Backend" → "Run workflow"
```

The deployment will automatically use the `:latest` tag. To deploy a specific version, update the image tag in deployment.yaml.

## Troubleshooting

```bash
# Check pod status
kubectl describe pod -l app=bandcheck-backend -n bandcheck

# View logs
kubectl logs -f deployment/bandcheck-backend -n bandcheck

# Check all recent logs
kubectl logs --tail=100 deployment/bandcheck-backend -n bandcheck

# Execute into pod
kubectl exec -it deployment/bandcheck-backend -n bandcheck -- sh

# Check service endpoints
kubectl get endpoints -n bandcheck
```
