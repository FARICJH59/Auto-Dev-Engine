# Multi-Agent System Documentation

## Overview

This repository implements a multi-agent orchestration system that leverages multiple specialized agents to perform various tasks in a coordinated manner. The system is designed to be modular, scalable, and easy to extend with new agents.

## Agent Directory Structure

```
agents/
├── lsas/          # Language Service Analysis System
├── pulse/         # System Health Monitoring
├── parso/         # Python Parsing and Analysis
└── gemini/        # AI-powered Code Analysis
```

## Phase 1 Agents

### LSAS Agent (Language Service Analysis System)
- **Location**: `agents/lsas/agent.sh`
- **Purpose**: Performs language service analysis on the codebase
- **Status**: Implemented
- **Execution**: Part of matrix-based workflow execution

### Pulse Agent
- **Location**: `agents/pulse/agent.sh`
- **Purpose**: Monitors system health and performance metrics
- **Status**: Implemented
- **Execution**: Part of matrix-based workflow execution

### Parso Agent
- **Location**: `agents/parso/agent.sh`
- **Purpose**: Python code parsing and analysis
- **Status**: Implemented
- **Execution**: Part of matrix-based workflow execution

### Gemini Agent
- **Location**: `agents/gemini/agent.sh`
- **Purpose**: AI-powered code analysis using Gemini API
- **Status**: Implemented
- **Execution**: Part of matrix-based workflow execution
- **Note**: Requires `GEMINI_API_KEY` secret to be configured

## Workflow Integration

### Run Agents Workflow
- **File**: `.github/workflows/run-agents.yml`
- **Trigger**: Manual dispatch or push to main branch
- **Strategy**: Matrix-based execution for all agents
- **Features**:
  - Parallel execution of agents
  - Individual log collection per agent
  - Status reporting for each agent
  - Aggregate results compilation
  - Artifact retention (30 days for logs, 90 days for reports)

### Mermaid Integration Workflow
- **File**: `.github/workflows/mermaid-integration.yml`
- **Trigger**: Manual dispatch or push to main branch
- **Purpose**: Generate and update architecture diagrams
- **Features**:
  - Automatic diagram generation from `.mmd` files
  - SVG and PNG output formats
  - Automatic commit of updated diagrams
  - Artifact storage for diagram files

## Running Agents

### Via GitHub Actions
1. Navigate to the Actions tab in the repository
2. Select "Run Multi-Agent System" workflow
3. Click "Run workflow"
4. Select the branch to run on
5. Click "Run workflow" to start execution

### Locally
```bash
# Run individual agent
bash agents/lsas/agent.sh

# Run all agents
for agent in lsas pulse parso gemini; do
  bash agents/${agent}/agent.sh
done
```

## Adding New Agents

To add a new agent to the system:

1. Create a new directory under `agents/`:
   ```bash
   mkdir agents/new-agent
   ```

2. Create an `agent.sh` script:
   ```bash
   touch agents/new-agent/agent.sh
   chmod +x agents/new-agent/agent.sh
   ```

3. Update `.github/workflows/run-agents.yml`:
   - Add the new agent name to the matrix strategy

4. Update this documentation with agent details

## Monitoring and Logs

### Accessing Logs
- Logs are uploaded as artifacts after each workflow run
- Access via: Actions → Workflow Run → Artifacts section
- Individual agent logs: `agent-{name}-logs`
- Status reports: `agent-{name}-status`
- Aggregate report: `execution-report`

### Status Indicators
- ✅ Success: Agent completed without errors
- ❌ Failed: Agent encountered errors during execution
- ⚠️ Unknown: Status could not be determined

## Architecture

The system architecture is documented in the Mermaid diagram file `architecture-diagram.mmd`. This diagram is automatically converted to SVG and PNG formats by the Mermaid Integration workflow.

View the architecture diagram:
- [SVG Format](architecture-diagram.svg)
- [PNG Format](architecture-diagram.png)

## Future Enhancements

### Phase 2 Agents (Planned)
- AgentX: TBD
- AgentY: TBD
- AgentZ: TBD

### Phase 3 Agents (Planned)
- Analytics Agent: Result aggregation and analysis
- Reporting Agent: Comprehensive reporting and visualization

### Deployment Integration (Planned)
- Cloud Run deployment automation
- Vercel frontend deployment
- Cloud logging and monitoring integration

## Troubleshooting

### Agent Fails to Execute
1. Check agent script permissions: `ls -la agents/*/agent.sh`
2. Verify agent script syntax: `bash -n agents/{name}/agent.sh`
3. Review workflow logs in GitHub Actions

### Workflow Errors
1. Verify workflow YAML syntax
2. Check required secrets are configured
3. Ensure branch permissions are correct

## Contributing

When contributing new agents or modifying existing ones:
1. Follow the existing agent structure
2. Include proper logging and status reporting
3. Update this documentation
4. Test locally before committing
5. Ensure workflows pass in GitHub Actions

## License

See [LICENSE](LICENSE) file for details.
