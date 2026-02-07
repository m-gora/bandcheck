# Bandcheck

Music discovery platform with community-contributed content warnings.

## 📚 Documentation

The comprehensive architecture documentation is located in the [`architecture/`](architecture/) directory.

### Quick Links

- **[Architecture Overview](architecture/index.adoc)** - Complete system documentation
- **[Getting Started Guide](architecture/introduction.adoc)** - Goals and requirements
- **[Deployment Guide](architecture/deployment.adoc)** - Infrastructure and CI/CD
- **[Architectural Decisions](architecture/architectural_decisions.adoc)** - Key design decisions

### What's Inside

- **Technology Stack:** React, TypeScript, Bun, SQLite, Kubernetes
- **Architecture Pattern:** Hexagonal architecture (ports & adapters)
- **Infrastructure:** Kubernetes, Docker, Cloudflare (DNS + CDN)
- **CI/CD:** GitHub Actions (build) + ArgoCD (deployment)
- **Security:** Auth0 authentication, Cloudflare Turnstile bot protection
- **Compliance:** GDPR, German TMG, EU E-Commerce Directive

## 🚀 Quick Start

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Opens on http://localhost:5173

### Backend Development

```bash
cd backend
bun install
bun dev
```

Runs on http://localhost:3000

## 📖 Additional Documentation

- **Frontend README:** [`frontend/README.md`](frontend/README.md)
- **Backend README:** [`backend/README.md`](backend/README.md)
- **Architecture Docs:** [`architecture/README.md`](architecture/README.md)

## 🏗️ Project Structure

```
bandcheck/
├── architecture/          # Complete architecture documentation (AsciiDoc)
├── backend/              # Backend API (Bun + TypeScript)
│   ├── src/
│   │   ├── core/        # Business logic (hexagonal architecture)
│   │   ├── adapters/    # HTTP, database adapters
│   │   └── db/          # Database schema
│   └── k8s/             # Kubernetes manifests
├── frontend/            # Frontend SPA (React + TypeScript)
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── services/    # API client
│   └── k8s/             # Kubernetes manifests
└── infrastructure/      # Terraform configuration
```

## 🤝 Contributing

This is an open-source, non-profit project. Contributions are welcome!

1. Read the [architecture documentation](architecture/)
2. Check the [hexagonal architecture guide](architecture/building_blocks.adoc)
3. Follow TypeScript best practices
4. Write tests for new features
5. Submit a pull request

## 📝 License

See [LICENSE](LICENSE) file for details.

## 🔗 Related Links

- **Auth0:** Authentication provider
- **Cloudflare Turnstile:** Bot protection
- **Kubernetes (K3s):** Container orchestration
- **Drizzle ORM:** Type-safe database access
