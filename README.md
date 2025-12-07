# Auto-Dev-Engine

**A comprehensive DevOps automation platform for orchestrating intelligent agents on Cloud Run and Vercel.**

![Phase 1 Complete](https://img.shields.io/badge/Phase%201-Complete-brightgreen)
![Security](https://img.shields.io/badge/CodeQL-Passing-brightgreen)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen)

## Overview

Auto-Dev-Engine is a DevOps orchestration platform that enables automated agent execution through a REST API and CLI interface. Built for cloud-native deployment on Google Cloud Run and Vercel, it provides a flexible framework for running custom agents with manifest-based configuration.

## Phase 1 Features ✅

- **REST API Orchestrator** - Express-based service with three endpoints (run, status, pipeline)
- **CLI Tool** - Command-line interface with init, deploy, run, and pipeline commands
- **Manifest System** - YAML-based configuration for projects, agents, and deployments
- **GitHub Actions** - Matrix-based workflows for parallel agent execution
- **Security** - Input validation, path traversal prevention, CodeQL verified
- **Example Agents** - Four sample agents (lsas, pulse, parso, gemini)

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Google Cloud SDK (for Cloud Run deployment)
- Vercel CLI (for Vercel deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/FARICJH59/Auto-Dev-Engine.git
cd Auto-Dev-Engine

# Install orchestrator dependencies
cd orchestrator
npm install
npm run build

# Install CLI dependencies
cd ../cli
npm install
npm run build
```

### Usage

#### Initialize a new project:
```bash
cd cli
node bin/ade.js init
```

#### Run an agent locally:
```bash
node bin/ade.js run lsas --tenant my-tenant --project my-project
```

#### Start the orchestrator:
```bash
cd orchestrator
npm start
# Server runs on http://localhost:8080
```

#### Test the API:
```bash
# Health check
curl http://localhost:8080/health

# Run an agent
curl -X POST http://localhost:8080/run \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "test", "projectId": "demo", "agent": "lsas"}'

# Check agent status
curl http://localhost:8080/status/lsas

# Run a pipeline
curl -X POST http://localhost:8080/pipeline/start \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "test", "projectId": "demo", "pipeline": "ci", "agents": ["lsas", "pulse"]}'
```

## Documentation

- **[PHASE1.md](PHASE1.md)** - Complete Phase 1 implementation details
- **[SECURITY.md](SECURITY.md)** - Security measures and best practices
- **[orchestrator/README.md](orchestrator/README.md)** - Orchestrator API documentation
- **[cli/README.md](cli/README.md)** - CLI command reference

## Architecture

```
Auto-Dev-Engine/
├── orchestrator/        # Cloud Run service (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts            # Server setup
│   │   ├── router.ts           # REST endpoints
│   │   └── agent-runner.ts     # Agent execution engine
│   └── Dockerfile
├── cli/                # Command-line interface
│   ├── bin/ade.js
│   └── src/commands/
├── manifests/          # Configuration files
│   ├── project.yaml
│   ├── agents.yaml
│   ├── cloudrun.yaml
│   └── vercel.json
├── agents/             # Agent implementations
│   ├── lsas/
│   ├── pulse/
│   ├── parso/
│   └── gemini/
└── .github/workflows/  # GitHub Actions
    ├── run-agents.yml
    ├── deploy-cloudrun.yml
    └── deploy-vercel.yml
```

## API Endpoints

### `POST /run`
Execute a single agent.
```json
{
  "tenantId": "string",
  "projectId": "string",
  "agent": "string"
}
```

### `GET /status/:agent`
Get the status of the most recent agent execution.

### `POST /pipeline/start`
Execute multiple agents in sequence.
```json
{
  "tenantId": "string",
  "projectId": "string",
  "pipeline": "string",
  "agents": ["agent1", "agent2"]
}
```

## CLI Commands

- `ade init` - Initialize project structure
- `ade deploy cloudrun` - Deploy to Google Cloud Run
- `ade deploy vercel` - Deploy to Vercel
- `ade run <agent>` - Execute an agent
- `ade pipeline <name>` - Run a pipeline

## Security

All security measures documented in [SECURITY.md](SECURITY.md):
- ✅ Input validation and sanitization
- ✅ Path traversal prevention
- ✅ Workflow permission hardening
- ✅ CodeQL security scanning (0 alerts)

## Deployment

### Cloud Run
```bash
gcloud run deploy orchestrator \
  --source ./orchestrator \
  --region us-central1 \
  --platform managed
```

### Vercel
```bash
vercel deploy --prod
```

## Creating Agents

Agents are Node.js scripts that receive environment variables:

```javascript
#!/usr/bin/env node

const tenantId = process.env.TENANT_ID;
const projectId = process.env.PROJECT_ID;
const agentName = process.env.AGENT_NAME;

console.log(`[${agentName}] Starting...`);
// Your agent logic here
process.exit(0);  // 0 for success, non-zero for failure
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run security checks: Tests must pass and CodeQL must show 0 alerts
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file

## Roadmap

### Phase 2 (Planned)
- Authentication and authorization
- Agent scheduling
- Webhook support
- Dashboard UI
- Agent marketplace
- Enhanced monitoring

## Support

- 📚 [Documentation](./PHASE1.md)
- 🔒 [Security](./SECURITY.md)
- 🐛 [Issues](https://github.com/FARICJH59/Auto-Dev-Engine/issues)

---

**Built with ❤️ using Node.js, TypeScript, Express, and Cloud Run**
