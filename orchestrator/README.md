# Auto-Dev-Engine Orchestrator

The orchestrator is a Cloud Run service that manages agent execution and provides REST APIs for DevOps automation.

## Features

- Execute individual agents or pipelines
- Load configuration from manifest files
- Emit structured logs
- Track agent execution status
- REST API endpoints for integration

## API Endpoints

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
Get the status of the most recent agent execution.

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
Start a pipeline with multiple agents.

**Request:**
```json
{
  "tenantId": "tenant-123",
  "projectId": "project-456",
  "pipeline": "ci-pipeline",
  "agents": ["lsas", "pulse", "parso"]
}
```

**Response:**
```json
{
  "success": true,
  "pipeline": "ci-pipeline",
  "result": {
    "agents": {
      "lsas": { "status": "success", "timestamp": "..." },
      "pulse": { "status": "success", "timestamp": "..." }
    },
    "overallStatus": "success"
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

## Deployment

Deploy to Cloud Run:
```bash
gcloud run deploy orchestrator \
  --source . \
  --region us-central1 \
  --platform managed
```

## Configuration

The orchestrator loads configuration from `/manifests`:
- `project.yaml` - Project configuration
- `agents.yaml` - Agent enablement settings
- `cloudrun.yaml` - Cloud Run deployment settings
