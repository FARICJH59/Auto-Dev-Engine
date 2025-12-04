# ADE Fusion Stack

**Auto Dev Engine** - A performance-tuned, security-hardened microservices platform for automated development workflows.

## 🚀 Overview

The ADE Fusion Stack is a collection of TypeScript and Python services designed for high-performance automated development:

- **Project Generator** - Scaffolds new projects from templates
- **Vision Agent** - Handles image and visual analysis tasks
- **Inventory Agent** - Manages resources and inventory tracking
- **Orchestrator** - Python FastAPI service coordinating all components
- **UI** - Web interface for the platform

## 📦 Package Management

This project uses **pnpm workspaces** for efficient package management with shared dependencies.

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (recommended)
- Python >= 3.12 (for orchestrator)

### Installation

```bash
# Install pnpm globally (if not installed)
npm install -g pnpm

# Install all dependencies
pnpm install

# Or use npm fallback
npm install --workspaces
```

### Workspace Commands

```bash
# Build all packages
pnpm build
# Or: pnpm -r run build

# Build a specific package
pnpm --filter @ade/shared-sdk build
pnpm --filter @ade/project-generator build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Run security checks
pnpm security-check

# Clean all build artifacts
pnpm clean
```

### npm Compatibility

While pnpm is recommended, npm workspaces are also supported:

```bash
# Using npm
npm run build:npm
npm run lint:npm
npm run test:npm
npm run audit:npm
```

## 🏗️ Project Structure

```
├── services/
│   ├── shared-sdk/          # Shared utilities and types
│   ├── project-generator/   # Project scaffolding service
│   ├── vision-agent/        # Image analysis service
│   └── inventory-agent/     # Inventory management service
├── ui/                      # Web interface
├── orchestrator/            # Python FastAPI orchestrator
├── scripts/
│   └── security-check.sh    # Security validation script
├── terraform/               # Infrastructure as Code
│   ├── modules/
│   │   ├── cloudrun/        # Cloud Run deployments
│   │   ├── pubsub/          # Message queuing
│   │   ├── firestore/       # Document database
│   │   └── cloudsql/        # Relational database
│   └── environments/        # Environment-specific configs
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── package.json             # Root package.json
```

## 🐳 Docker Images

All services use multi-stage Dockerfiles optimized for:

### Node.js Services
- **Build stage**: `node:22-slim` with pnpm for dependency management
- **Runtime stage**: `gcr.io/distroless/nodejs22-debian12` (pinned by digest)
- Benefits:
  - Smaller image size (~70% reduction)
  - Reduced attack surface (no shell, package managers, or OS utilities)
  - Faster cold starts

### Python Orchestrator
- **Build stage**: `python:3.12-slim` with wheel caching
- **Runtime stage**: `python:3.12-slim` with uvicorn workers
- Benefits:
  - Pre-built wheels for faster deployments
  - Non-root user execution
  - Multiple uvicorn workers for concurrency

### Building Images

```bash
# Build Node.js service
docker build -f services/project-generator/Dockerfile -t ade-project-generator .

# Build Python orchestrator
docker build -f orchestrator/Dockerfile -t ade-orchestrator .
```

## ☁️ Cloud Run Tuning

Services are optimized for Google Cloud Run with these settings:

| Service           | Concurrency | Min Instances | CPU Throttling |
|-------------------|-------------|---------------|----------------|
| project-generator | 250         | 0             | Yes            |
| vision-agent      | 80          | 0             | No             |
| inventory-agent   | 150         | 0             | Yes            |
| ui                | 200         | 0             | Yes            |
| orchestrator      | 100         | 0             | Yes            |

### Performance Rationale

- **Concurrency**: Set based on expected request patterns and resource requirements
  - Vision agent uses lower concurrency due to memory-intensive operations
  - Project generator can handle more concurrent requests with lighter workloads
- **Min Instances 0**: Cost optimization for dev/staging; increase for production
- **CPU Throttling**: Enabled where appropriate to reduce costs; disabled for CPU-intensive services

## 🔐 Security

### Rugged-Silo Security Model

This project follows the Rugged-Silo security model:

1. **Action Pinning**: All GitHub Actions are pinned by SHA digest on the main branch
2. **Image Pinning**: Docker base images are pinned by digest
3. **Security Checks**: Portable `security-check.sh` runs before builds
4. **SBOM Generation**: CycloneDX SBOM generated for UI package
5. **Audit Gating**: npm audit with `--audit-level=high` for UI

### Running Security Checks

```bash
# Run security validation
./scripts/security-check.sh

# Generate SBOM (UI package)
cd ui && pnpm sbom

# Run npm audit
pnpm audit --audit-level=high
```

## 🏭 CI/CD Pipeline

The pipeline includes:

1. **Security Check** - Node version validation, dependency audit
2. **Matrix Build** - Parallel lint/test/build for all packages
3. **SBOM Generation** - CycloneDX for supply chain security
4. **Audit Gate** - npm audit with high severity threshold
5. **Policy Gate** - Custom policy validation
6. **Quota Gate** - Resource quota checks
7. **CodeQL Analysis** - Static code analysis
8. **Deploy** - Cloud Run deployment (gated by all checks)

### Action Pinning Policy

- **main branch**: All actions pinned by SHA digest
- **dev/staging branches**: Version tags allowed
- Automated check enforces pinning on merge to main

## 📊 Terraform Infrastructure

Deploy infrastructure using Terraform workspaces:

```bash
cd terraform

# Initialize
terraform init

# Select workspace
terraform workspace select dev  # or staging, prod

# Plan
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply
terraform apply -var-file=environments/dev/terraform.tfvars
```

### Modules

- **cloudrun**: Cloud Run service deployments with autoscaling
- **pubsub**: Message queuing for inter-service communication
- **firestore**: Document database for application data
- **cloudsql**: PostgreSQL for relational data (optional)

### Parallel Resource Creation

Terraform is configured for parallel resource creation where safe, reducing deployment time.

## 🧪 Development

### Running Locally

```bash
# Start shared-sdk build in watch mode
cd services/shared-sdk && pnpm build --watch

# Start a service
cd services/project-generator && pnpm dev

# Start orchestrator
cd orchestrator && uvicorn main:app --reload
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | Service-specific |
| `LOG_LEVEL` | Logging level | `info` |
| `NODE_ENV` | Node environment | `development` |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
