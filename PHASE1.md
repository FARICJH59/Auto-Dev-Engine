# Phase 1 Implementation - Auto-Dev-Engine DevOps Platform

## Overview

Phase 1 establishes the foundational DevOps scaffolding for the Auto-Dev-Engine platform, including:
- Orchestrator service (Cloud Run ready)
- CLI tool for local development
- Manifest-based configuration system
- GitHub Actions workflows for CI/CD
- Example agents for testing

## Directory Structure

```
/orchestrator          # Cloud Run service for agent orchestration
  /src
    index.ts          # Express server with REST API
    router.ts         # API endpoints
    agent-runner.ts   # Agent execution engine
  package.json
  tsconfig.json
  Dockerfile

/cli                  # Command-line interface
  /bin
    ade.js           # CLI entry point
  /src/commands
    init.ts          # Project initialization
    deploy.ts        # Deployment commands
    run-agent.ts     # Agent execution
  package.json
  tsconfig.json

/manifests            # Configuration files
  project.yaml       # Project settings
  agents.yaml        # Agent enablement
  cloudrun.yaml      # Cloud Run configuration
  vercel.json        # Vercel deployment settings

/agents               # Agent implementations
  /lsas              # List, Scan, Analyze, Summarize agent
  /pulse             # Health check agent
  /parso             # Parser agent
  /gemini            # AI-powered agent

/.github/workflows    # GitHub Actions
  run-agents.yml     # Matrix-based agent execution
  deploy-cloudrun.yml # Cloud Run deployment
  deploy-vercel.yml  # Vercel deployment

/logs                 # Execution logs (gitignored)
```

## Orchestrator API

The orchestrator exposes three REST endpoints:

### POST /run
Execute a single agent.

**Request:**
```json
{
  "tenantId": "tenant-123",
  "projectId": "project-456",
  "agent": "lsas"
}
```

**Response:**
```json
{
  "success": true,
  "agent": "lsas",
  "result": {
    "status": "success",
    "output": "...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /status/:agent
Get status of the most recent agent execution.

**Response:**
```json
{
  "agent": "lsas",
  "status": {
    "status": "success",
    "lastRun": "2024-01-01T00-00-00-000Z"
  }
}
```

### POST /pipeline/start
Execute multiple agents in sequence.

**Request:**
```json
{
  "tenantId": "tenant-123",
  "projectId": "project-456",
  "pipeline": "ci-pipeline",
  "agents": ["lsas", "pulse", "parso"]
}
```

## CLI Commands

### ade init
Initialize a new Auto-Dev-Engine project:
```bash
ade init
```

Creates directory structure and default manifest files.

### ade deploy
Deploy services:
```bash
ade deploy cloudrun  # Deploy orchestrator to Cloud Run
ade deploy vercel    # Deploy UI to Vercel
```

### ade run
Execute an agent locally:
```bash
ade run lsas --tenant my-tenant --project my-project
```

### ade pipeline
Execute a pipeline:
```bash
ade pipeline ci-pipeline --tenant my-tenant --project my-project
```

## GitHub Workflows

### run-agents.yml
Matrix-based workflow for parallel agent execution. Supports:
- Manual trigger via workflow_dispatch
- Run all agents or specific agents
- Parallel execution
- Log artifact upload

### deploy-cloudrun.yml
Automated deployment to Google Cloud Run:
- Triggers on push to main (orchestrator changes)
- Builds and deploys container
- Health check validation

### deploy-vercel.yml
Automated deployment to Vercel:
- Triggers on push to main
- Builds and deploys frontend/API

## Configuration

### project.yaml
```yaml
projectId: auto-dev-engine
cloud:
  primary: gcp
  region: us-central1
vercel:
  project: auto-dev-engine-ui
```

### agents.yaml
```yaml
agents:
  lsas:
    enabled: true
  pulse:
    enabled: true
  parso:
    enabled: true
  gemini:
    enabled: true
```

### cloudrun.yaml
```yaml
service: orchestrator
runtime: node20
cpu: 1
memory: 512Mi
minInstances: 0
maxInstances: 3
```

## Getting Started

### 1. Install Dependencies

Orchestrator:
```bash
cd orchestrator
npm install
npm run build
```

CLI:
```bash
cd cli
npm install
npm run build
```

### 2. Run Orchestrator Locally

```bash
cd orchestrator
npm start
```

Server runs on port 8080.

### 3. Test with CLI

```bash
cd cli
node bin/ade.js run lsas --tenant test --project demo
```

### 4. Test API

```bash
# Health check
curl http://localhost:8080/health

# Run agent
curl -X POST http://localhost:8080/run \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "test", "projectId": "demo", "agent": "lsas"}'

# Check status
curl http://localhost:8080/status/lsas

# Run pipeline
curl -X POST http://localhost:8080/pipeline/start \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "test", "projectId": "demo", "pipeline": "ci", "agents": ["lsas", "pulse"]}'
```

## Agent Development

Agents are Node.js scripts that receive environment variables:
- `TENANT_ID` - Tenant identifier
- `PROJECT_ID` - Project identifier
- `AGENT_NAME` - Agent name

Example agent structure:
```javascript
#!/usr/bin/env node

const tenantId = process.env.TENANT_ID || 'unknown';
const projectId = process.env.PROJECT_ID || 'unknown';
const agentName = process.env.AGENT_NAME || 'myagent';

console.log(`[${agentName}] Starting...`);
// Agent logic here
console.log(`[${agentName}] Completed`);
process.exit(0);  // 0 for success, non-zero for failure
```

## Logging

Logs are stored in `/logs` with timestamped directories:
```
logs/
  2024-01-01T00-00-00-000Z/
    lsas.log       # Agent output
    lsas.status    # success|failed|skipped
  orchestrator.log  # Orchestrator logs
```

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

## Phase 1 Deliverables ✅

- [x] DevOps scaffolding structure
- [x] Orchestrator with REST API
- [x] CLI with commands (init, deploy, run, pipeline)
- [x] Manifest system (YAML configuration)
- [x] GitHub Actions workflows
- [x] Example agents (lsas, pulse, parso, gemini)
- [x] Logging system
- [x] Docker support for Cloud Run
- [x] Documentation

## Next Steps (Phase 2+)

- Add authentication/authorization
- Implement agent scheduling
- Add webhook support
- Create dashboard UI
- Implement agent marketplace
- Add monitoring and metrics
- Support for additional cloud providers
