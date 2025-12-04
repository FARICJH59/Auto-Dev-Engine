# Auto-Dev-Engine (ADE)

**Phase 2: Core Infrastructure & Services**

A comprehensive autonomous development engine with policy-driven access control, quota management, intelligent model routing, and extensible tool integration.

## Overview

Auto-Dev-Engine (ADE) is a platform for orchestrating automated development workflows. It provides:

- **Policy Engine**: Fine-grained access control with default deny-all security
- **Quota Engine**: Token bucket rate limiting for resource management
- **Model Router**: Intelligent routing to AI model endpoints based on policy and availability
- **Tool Bus**: Plugin registry and capability negotiation framework
- **Level-6 Orchestrator**: High-level workflow coordination and execution

## Directory Structure

```
Auto-Dev-Engine/
├── backend/                    # Backend service
│   ├── src/                    # Source code
│   ├── tests/                  # Test files
│   └── docs/                   # Backend documentation
├── frontend/                   # Frontend application
│   ├── src/                    # React source code
│   ├── public/                 # Static assets
│   ├── tests/                  # Test files
│   └── docs/                   # Frontend documentation
├── orchestration/              # Orchestration layer
│   └── auto-orchestrator/
│       └── level-6/            # Level-6 orchestrator
├── services/                   # Shared services
│   ├── policyEngine/           # Policy evaluation service
│   ├── quotaEngine/            # Quota management service
│   └── modelRouter/            # Model routing service
├── bus/                        # Integration bus
│   └── toolBus/                # Tool plugin bus
├── pipelines/                  # CI/CD pipeline definitions
├── configs/                    # Shared configurations
├── adapters/                   # External system adapters
├── scripts/                    # Automation scripts
│   ├── powershell/             # Windows scripts
│   └── bash/                   # Linux/macOS scripts
├── ops/                        # Operations
│   ├── configs/                # Operational configs
│   ├── observability/          # Monitoring setup
│   └── security/               # Security documentation
└── .github/                    # GitHub configurations
    ├── workflows/              # CI/CD workflows
    ├── actions/                # Composite actions
    └── dependabot.yml          # Dependency updates
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm 9+
- Git
- (Optional) Python 3.11+ for additional tooling

### Setup

**Option 1: Using Make**
```bash
make setup-phase2
```

**Option 2: Using Scripts**
```bash
# Linux/macOS
./scripts/bash/setup-phase2.sh

# Windows (PowerShell)
./scripts/powershell/setup-phase2.ps1
```

**Option 3: Manual Setup**
```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd services && npm install && cd ..

# Build
make build
# or
npm run build --prefix backend
npm run build --prefix frontend
```

## Development Commands

| Command | Description |
|---------|-------------|
| `make setup-phase2` | Run complete Phase-2 setup |
| `make install` | Install all dependencies |
| `make build` | Build all components |
| `make test` | Run all tests |
| `make lint` | Lint all code |
| `make clean` | Clean build artifacts |
| `make run-orchestrator` | Start the orchestrator |
| `make validate-configs` | Validate configuration files |
| `make help` | Show all available commands |

## Core Services

### Policy Engine
Evaluates access policies with a default deny-all stance for security.

```typescript
import { PolicyEngine } from './services/policyEngine';

const engine = new PolicyEngine();
const result = await engine.evaluate({
  principal: 'user:alice',
  action: 'read',
  resource: 'model:gpt-4'
});
```

### Quota Engine
Token bucket implementation for rate limiting and resource management.

```typescript
import { QuotaEngine } from './services/quotaEngine';

const engine = new QuotaEngine();
const reservation = await engine.reserve({
  principal: 'user:alice',
  resource: 'model:gpt-4',
  tokens: 100
});
```

### Model Router
Routes requests to appropriate model endpoints based on policy and quota.

```typescript
import { ModelRouter } from './services/modelRouter';

const router = new ModelRouter(config, policyEngine, quotaEngine);
const result = await router.selectRoute({
  principal: 'user:alice',
  capabilities: ['chat', 'code'],
  estimatedTokens: 1000
});
```

### Tool Bus
Plugin registry with capability negotiation.

```typescript
import { ToolBus } from './bus/toolBus';

const bus = new ToolBus();
bus.registerPlugin(myPlugin);
const result = await bus.execute({
  capabilityId: 'analyze-code',
  input: { code: '...' }
});
```

## Configuration

Configuration files are located in each service directory:

- `services/policyEngine/config.json` - Policy rules
- `services/quotaEngine/config.json` - Quota limits
- `services/modelRouter/config.json` - Routing rules
- `bus/toolBus/config.json` - Tool bus settings

Environment variables are loaded from:
- `.env.development` - Development settings
- `.env.local` - Local overrides (not committed)

## CI/CD

The Phase-2 workflow (`.github/workflows/phase2.yml`) includes:

1. **Lint** - Code quality checks
2. **Test Backend** - Backend unit tests
3. **Test Frontend** - Frontend unit tests
4. **Build Backend** - TypeScript compilation
5. **Build Frontend** - Vite build
6. **Policy Gate** - Validates policy configuration
7. **Quota Gate** - Validates quota configuration
8. **Security Scan** - npm audit for vulnerabilities
9. **Deploy** - Staging/Production deployment

## Documentation

- [Level-6 Orchestrator](./orchestration/auto-orchestrator/level-6/README.md)
- [Observability](./ops/observability/README.md)
- [Security](./ops/security/README.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Run lint: `make lint`
6. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.
