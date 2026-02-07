# BandCheck Backend - Kubernetes Deployment

Backend API server for BandCheck running on Bun in Kubernetes.

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

```bash
# Build the image
docker build -t bandcheck-backend .

# Run locally
docker run -p 3000:3000 --env-file .env bandcheck-backend

# Or use the npm script
bun run docker:build
bun run docker:run
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster with kubectl configured
- NGINX Ingress Controller installed
- cert-manager for TLS certificates (optional)
- Container registry (Docker Hub, GitHub Container Registry, etc.)

### Setup

1. **Create secrets:**

```bash
kubectl create namespace bandcheck

kubectl create secret generic bandcheck-secrets \
  --namespace bandcheck \
  --from-literal=auth0-domain="auth.marcodoes.tech" \
  --from-literal=auth0-audience="https://api.bandcheck.marcodoes.tech" \
  --from-literal=azure-tables-url="https://bandcheckstorage.table.core.windows.net" \
  --from-literal=azure-storage-account-name="bandcheckstorage" \
  --from-literal=azure-client-id="your-client-id"
```

2. **Build and push Docker image:**

```bash
# Build for your platform
docker build -t your-registry/bandcheck-backend:latest .

# Push to registry
docker push your-registry/bandcheck-backend:latest
```

3. **Update deployment.yaml with your image:**

Edit `k8s/deployment.yaml` and replace `your-registry/bandcheck-backend:latest` with your actual image.

4. **Deploy to Kubernetes:**

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
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

# View logs
kubectl logs -f deployment/bandcheck-backend -n bandcheck
```

### Update Deployment

```bash
# Build and push new image
docker build -t your-registry/bandcheck-backend:v1.0.1 .
docker push your-registry/bandcheck-backend:v1.0.1

# Update deployment
kubectl set image deployment/bandcheck-backend \
  backend=your-registry/bandcheck-backend:v1.0.1 \
  -n bandcheck

# Or rollout restart
kubectl rollout restart deployment/bandcheck-backend -n bandcheck
```

### Scaling

```bash
# Scale to 3 replicas
kubectl scale deployment/bandcheck-backend --replicas=3 -n bandcheck
```

## Environment Variables

Required environment variables (set in k8s/secrets-template.yaml):

- `AUTH0_DOMAIN` - Auth0 domain
- `AUTH0_AUDIENCE` - Auth0 API audience
- `AZURE_TABLES_URL` - Azure Tables storage URL
- `AZURE_STORAGE_ACCOUNT_NAME` - Azure storage account name
- `AZURE_CLIENT_ID` - Azure managed identity client ID
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

## API Endpoints

- `GET /health` - Health check
- `GET /api/bands` - List all bands (with optional search/genre filters)
- `GET /api/bands/:id` - Get band details with reviews
- `POST /api/bands` - Submit a new band (requires authentication)
- `POST /api/bands/:id/reviews` - Submit a review (requires authentication)

## Troubleshooting

```bash
# Check pod status
kubectl describe pod -l app=bandcheck-backend -n bandcheck

# View logs
kubectl logs -f deployment/bandcheck-backend -n bandcheck

# Execute into pod
kubectl exec -it deployment/bandcheck-backend -n bandcheck -- sh

# Check service endpoints
kubectl get endpoints -n bandcheck
```
