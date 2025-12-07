# Phase 2: Agent Engine and Pipeline Orchestration

## Overview
Phase 2 implements the core agent execution engine and pipeline orchestrator with CLI commands, comprehensive logging, and manifest-based configuration.

## Architecture

### 1. Agent Engine (`/orchestrator/src/agent-runner.ts`)
The agent engine is responsible for:
- Reading agent configurations from `agents.yaml`
- Checking enabled flags before execution
- Executing agent scripts located at `agents/<agent>/<agent>-agent.js`
- Capturing stdout/stderr output
- Writing logs to `/logs/<timestamp>/<agent>.log`
- Creating status files for success, failure, and skipped states

**Key Functions:**
- `runAgent(agentName: string, logTimestamp?: string)`: Execute a single agent
- `isAgentEnabled(agentName: string, agentsConfig: any)`: Check if agent is enabled in manifest
- `skipAgent(agentName: string, logTimestamp: string, reason: string)`: Mark agent as skipped

### 2. Pipeline Orchestrator (`/orchestrator/src/pipeline.ts`)
The pipeline orchestrator handles:
- Loading pipeline definitions from `pipelines.yaml`
- Executing agents in parallel or sequential mode
- Aggregating results across all pipeline steps
- Generating final pipeline reports

**Key Functions:**
- `runPipeline(agentList: string[], parallel: boolean)`: Execute a list of agents
- `runNamedPipeline(pipelineName: string)`: Execute a named pipeline from configuration

### 3. CLI Commands

#### Run Single Agent (`ade run <agent>`)
Located in `/cli/src/commands/run-agent.ts`
```bash
ade run lsas
```
Executes a single agent and displays real-time logs.

#### Run Pipeline (`ade pipeline <pipelineName>`)
Located in `/cli/src/commands/pipeline.ts`
```bash
ade pipeline default
ade pipeline fast-track
```
Executes all agents in a pipeline and provides aggregated results.

### 4. Manifests

#### agents.yaml
Defines available agents and their configuration:
```yaml
agents:
  lsas:
    enabled: true
    parallel: true
  pulse:
    enabled: true
    parallel: false
  parso:
    enabled: true
    parallel: true
  gemini:
    enabled: true
    parallel: true
```

#### pipelines.yaml
Defines pipeline sequences:
```yaml
pipelines:
  default:
    - lsas
    - pulse
    - parso
    - gemini
  fast-track:
    - lsas
    - gemini
```

### 5. Logging and Status

#### Log Structure
```
logs/
  <timestamp>/
    <agent>.log          # Combined stdout/stderr output
    <agent>.success      # Created on successful completion
    <agent>.failed       # Created on failure with error details
    <agent>.skipped      # Created when agent is disabled
```

#### Status Files
- **success**: Contains confirmation message and agent output
- **failed**: Contains exit code and error details
- **skipped**: Contains reason for skipping (e.g., "not enabled")

## Usage

### Installation
```bash
npm install
npm run build
```

### Running Tests
```bash
npm test
```

### CLI Usage
```bash
# Show help
node dist/cli/src/index.js

# Run a single agent
node dist/cli/src/index.js run lsas

# Run a pipeline
node dist/cli/src/index.js pipeline default
```

### Creating New Agents
1. Create directory: `agents/<agent-name>/`
2. Create script: `agents/<agent-name>/<agent-name>-agent.js`
3. Add to `agents.yaml`:
```yaml
agents:
  <agent-name>:
    enabled: true
    parallel: true
```
4. Add to pipeline in `pipelines.yaml` if needed

## Example Agent
See `agents/lsas/lsas-agent.js` for a simple example agent that demonstrates the basic structure.

## Testing
Unit tests are located in:
- `/orchestrator/src/__tests__/agent-runner.test.ts`
- `/orchestrator/src/__tests__/pipeline.test.ts`

Tests cover:
- Agent execution (success and failure cases)
- Status file creation
- Pipeline orchestration (parallel and sequential)
- Configuration loading
- Error handling

## Features Delivered
✓ Agent execution engine with logging  
✓ Pipeline orchestrator with parallel/sequential support  
✓ CLI commands: `ade run` and `ade pipeline`  
✓ Manifest-based configuration (agents.yaml, pipelines.yaml)  
✓ Comprehensive logging system with status files  
✓ Unit tests for core functionality  
✓ Sample agent for testing  

## Next Steps
To extend this system:
1. Create additional agents in the `agents/` directory
2. Configure them in `agents.yaml`
3. Add to pipelines as needed
4. Consider adding JSON output for dashboard integration
5. Add real-time log streaming for long-running agents
