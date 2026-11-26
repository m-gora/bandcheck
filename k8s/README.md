# Kubernetes deployment

The manifests in this directory deploy one Bandcheck backend and one frontend.
The backend uses the PostgreSQL service already running in the Hetzner k3s
cluster; it does not create a PostgreSQL instance or an application PVC.

## PostgreSQL prerequisites

Provision a separate `bandcheck` database and least-privilege `bandcheck` role
on the existing PostgreSQL server. Do not reuse the credentials used by other
applications. The backend connects over the cluster network at
`postgres-rw.postgres.svc.cluster.local:5432`.

Create the role and database through the PostgreSQL administrator, keeping the
password out of shell history and Git. Make `bandcheck` the database owner so
the startup migrator can create its migration schema and application tables.
The existing PostgreSQL volume provides persistence, not a verified backup;
confirm the cluster's backup and restore process separately.

Set `DATABASE_URL` to a PostgreSQL URL for that database, for example:

```text
postgres://bandcheck:<url-encoded-password>@postgres-rw.postgres.svc.cluster.local:5432/bandcheck
```

The backend runs Drizzle migrations during startup. The database role needs
permission to create its migration schema and application tables.

## SOPS secret

`k8s/bandcheck-secret.sops.yaml` contains `DATABASE_URL` and `TURNSTILE_KEY`,
encrypted to the age recipient in the repository's root `.sops.yaml`. It is
included in `k8s/kustomization.yaml`; Flux decrypts it using the existing
`sops-age` Secret in `flux-system`. Use `sops k8s/bandcheck-secret.sops.yaml`
to edit or rotate the values. Never commit a plaintext Secret.

Add `bandcheck.cloud.marcodoes.tech` to the allowed hostnames for the Cloudflare
Turnstile site key baked into the frontend image.

The Flux `Kustomization` that applies this repository must enable SOPS
decryption with the existing `sops-age` Secret in `flux-system`.

## Flux integration

Flux is already bootstrapped from the separate `m-gora/cluster-config`
repository. In that repository, add a `GitRepository` for
`https://github.com/m-gora/bandcheck` and a Flux `Kustomization` that applies
this repository's `./k8s` path. Configure its SOPS decryption as described
above; no Flux bootstrap is needed here.

Dependabot's Docker ecosystem monitors the Kubernetes manifests in `k8s/` and
opens PRs when newer semver image tags are available. Review and merge those
PRs; Flux then reconciles the updated manifests.

## HTTPRoutes and hostnames

The HTTPRoutes attach to HTTPS listeners on the existing `cluster` Gateway,
which terminates TLS. ExternalDNS creates Cloudflare DNS records for the route
hostnames:

- `bandcheck.cloud.marcodoes.tech`
- `bandcheck-api.cloud.marcodoes.tech`

The backend route preserves the Traefik `add-api-prefix` middleware. Set the
GitHub Actions secret `VITE_API_BASE_URL` to
`https://bandcheck-api.cloud.marcodoes.tech` (without `/api`), so the middleware
adds the prefix expected by the API. Update the Auth0 SPA's allowed callback,
logout, and web origins to `https://bandcheck.cloud.marcodoes.tech`.

Because the frontend URL is baked into its static bundle, publish a new
versioned frontend image after changing `VITE_API_BASE_URL`. The backend also
needs a new PostgreSQL-compatible image. Dependabot opens the Kubernetes image
tag PRs once those versioned images are published.

## Cutover notes

The current SQLite database only contains disposable test data. No database
dump or import is needed; recreate any desired test band after deployment.
Wait for the PostgreSQL-compatible backend image to be built and published
before enabling the Flux app source. The currently pinned backend image was
built for SQLite and cannot use the new PostgreSQL `DATABASE_URL`. Add the
encrypted runtime Secret before enabling the source. Keep the local deployment
available until the cloud app and DNS have been verified.
