# Auto-Dev-Engine CLI

Command-line interface for the Auto-Dev-Engine DevOps platform.

## Installation

```bash
cd cli
npm install
npm run build
```

## Commands

### ade init
Initialize a new Auto-Dev-Engine project with default structure and manifests.

```bash
ade init
```

Creates:
- `/agents` - Agent scripts directory
- `/manifests` - Configuration files
- `/logs` - Execution logs
- `/.github/workflows` - GitHub Actions workflows

### ade deploy cloudrun
Deploy the orchestrator to Google Cloud Run.

```bash
ade deploy cloudrun
```

### ade deploy vercel
Deploy the UI to Vercel.

```bash
ade deploy vercel
```

### ade run <agent>
Execute a specific agent locally.

```bash
ade run lsas --tenant my-tenant --project my-project
```

Options:
- `-t, --tenant <tenantId>` - Tenant ID (default: "default-tenant")
- `-p, --project <projectId>` - Project ID (default: "default-project")

### ade pipeline <name>
Execute a named pipeline.

```bash
ade pipeline ci-pipeline --tenant my-tenant --project my-project
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Test CLI
node bin/ade.js --help
```

## Configuration

The CLI reads configuration from `/manifests`:
- `project.yaml` - Project settings
- `agents.yaml` - Agent configuration
- `cloudrun.yaml` - Cloud Run settings
- `vercel.json` - Vercel deployment settings
