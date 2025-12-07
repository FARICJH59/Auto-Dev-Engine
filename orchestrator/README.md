# Auto-Dev-Engine Orchestrator

Phase 2 pipeline orchestration service for coordinating agent execution and managing deployment workflows.

## 🎯 Overview

The orchestrator is a Node.js Express application that:
- Manages agent lifecycle and execution
- Coordinates pipeline workflows
- Provides REST API for agent interaction
- Integrates with Phase 1 (agent matrix) and Phase 3 (deployment)

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Start in production mode
npm start
```

The server will start on `http://localhost:8080` (or the port specified in `PORT` environment variable).

### Docker

```bash
# Build Docker image
docker build -t ade-orchestrator .

# Run container
docker run -p 8080:8080 -e NODE_ENV=production ade-orchestrator
```

## 📡 API Endpoints

### Health & Status

**GET /health**
```bash
curl http://localhost:8080/health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-07T14:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

**GET /status**
```bash
curl http://localhost:8080/status
```
Response:
```json
{
  "orchestrator": "running",
  "agents": [...],
  "config": {
    "environment": "development",
    "region": "us-central1"
  },
  "timestamp": "2024-12-07T14:00:00.000Z"
}
```

### Agents

**GET /agents**
```bash
curl http://localhost:8080/agents
```
Lists all available agents.

**POST /agents/:agentName/execute**
```bash
curl -X POST http://localhost:8080/agents/codeAnalysis/execute \
  -H "Content-Type: application/json" \
  -d '{"repository": "example/repo", "branch": "main"}'
```
Executes a specific agent with provided payload.

### Pipeline

**POST /pipeline/execute**
```bash
curl -X POST http://localhost:8080/pipeline/execute \
  -H "Content-Type: application/json" \
  -d '{
    "id": "pipeline-1",
    "steps": [
      {
        "agent": "codeAnalysis",
        "payload": {"repo": "example/repo"}
      },
      {
        "agent": "testGeneration",
        "payload": {"coverage": "80%"}
      }
    ]
  }'
```
Executes a multi-step pipeline sequentially.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `8080` |
| `GCP_PROJECT_ID` | Google Cloud project ID | `""` |
| `GCP_REGION` | GCP region | `us-central1` |
| `GEMINI_API_KEY` | Google Gemini API key | `""` |

### Example .env File

```env
NODE_ENV=development
PORT=8080
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1
GEMINI_API_KEY=your-api-key
```

## 📦 Project Structure

```
orchestrator/
├── src/
│   └── pipeline.js       # Main orchestrator logic
├── agents/               # Agent-specific modules (future)
├── Dockerfile           # Container definition
├── .dockerignore        # Docker ignore patterns
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:8080/health

# Execute test pipeline
curl -X POST http://localhost:8080/pipeline/execute \
  -H "Content-Type: application/json" \
  -d '{"id":"test","steps":[{"agent":"codeAnalysis","payload":{}}]}'
```

## 🐳 Deployment

### Cloud Run

Deployed automatically via GitHub Actions (`deploy-cloud-run.yml`):

```bash
# Manual deployment
gcloud run deploy ade-orchestrator \
  --image gcr.io/PROJECT_ID/ade-orchestrator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Docker Compose (Local)

```yaml
version: '3.8'
services:
  orchestrator:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - GCP_PROJECT_ID=your-project
      - GCP_REGION=us-central1
```

## 🔍 Monitoring

### Logs

```bash
# Local logs
npm start

# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### Health Checks

The orchestrator includes a health check endpoint used by:
- Docker health checks
- Cloud Run health monitoring
- Load balancers

## 🛠️ Development

### Adding New Agents

1. Register agent in `agents` object:
```javascript
const agents = {
  newAgent: { name: 'new-agent', status: 'ready' },
  // ...
};
```

2. Implement agent logic in `executeAgent()` function

3. Test with API:
```bash
curl -X POST http://localhost:8080/agents/newAgent/execute \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Adding Pipeline Steps

Pipelines execute steps sequentially. Each step must reference a valid agent:

```json
{
  "id": "custom-pipeline",
  "steps": [
    {"agent": "codeAnalysis", "payload": {}},
    {"agent": "testGeneration", "payload": {}},
    {"agent": "deployment", "payload": {}}
  ]
}
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

---

Part of **Auto-Dev-Engine Phase 2** - Pipeline Orchestration
