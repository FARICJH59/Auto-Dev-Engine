# Agent Workflow Documentation

This repository contains a GitHub Actions workflow that runs multiple agents using a matrix strategy for efficient and scalable execution.

## Overview

The `run-agents.yml` workflow allows you to manually trigger the execution of four agents:
- **LSAS** - Located in `agents/lsas/lsas-agent.js`
- **Pulse** - Located in `agents/pulse/pulse-agent.js`
- **Parso** - Located in `agents/parso/parso-agent.js`
- **Gemini** - Located in `agents/gemini/gemini-agent.js`

## Workflow Structure

### Matrix Strategy

The workflow uses GitHub Actions' matrix strategy to run multiple agents efficiently:

```yaml
strategy:
  matrix:
    include:
      - name: LSAS
        dir: lsas
        flag: LSAS_ENABLED
      - name: Pulse
        dir: pulse
        flag: PULSE_ENABLED
      - name: Parso
        dir: parso
        flag: PARSO_ENABLED
      - name: Gemini
        dir: gemini
        flag: GEMINI_ENABLED
```

### Benefits of Matrix Strategy

1. **Parallel Execution**: All agents can run in parallel (by default)
2. **Code Reuse**: Single step definition for all agents
3. **Easy Extension**: Add new agents by adding entries to the matrix
4. **Clear Status**: Each agent shows as a separate job in the Actions UI

## Usage

### Triggering the Workflow

1. Navigate to the **Actions** tab in your repository
2. Select **Run Agents** from the workflow list
3. Click **Run workflow**
4. Configure the inputs:
   - `NODE_ENV`: Set to `production` or `development`
   - `LSAS_ENABLED`: Set to `true` to run LSAS agent
   - `PULSE_ENABLED`: Set to `true` to run Pulse agent
   - `PARSO_ENABLED`: Set to `true` to run Parso agent
   - `GEMINI_ENABLED`: Set to `true` to run Gemini agent
5. Click **Run workflow** to start execution

### Agent Execution Logic

Each agent follows this execution logic:

1. **Check if enabled**: Reads the corresponding environment variable (e.g., `LSAS_ENABLED`)
2. **Skip if disabled**: If not enabled, writes "skipped" status and exits
3. **Check script exists**: Verifies the agent script file exists
4. **Execute**: Runs the Node.js script and captures output
5. **Report status**: Writes success/failure status to log files

### Output Files

Each agent generates two files in the `logs/` directory:

- `logs/{agent}.status`: Contains "success", "failed", or "skipped"
- `logs/{agent}.log`: Contains the agent's console output

## Agent Development

### Creating a New Agent

To add a new agent:

1. Create a directory: `agents/{agent-name}/`
2. Create the agent script: `agents/{agent-name}/{agent-name}-agent.js`
3. Update the workflow matrix in `.github/workflows/run-agents.yml`:
   ```yaml
   - name: NewAgent
     dir: new-agent
     flag: NEW_AGENT_ENABLED
   ```
4. Add the input in the workflow_dispatch section:
   ```yaml
   NEW_AGENT_ENABLED:
     description: 'Enable NewAgent agent'
     required: false
     default: 'true'
   ```
5. Add the environment variable mapping:
   ```yaml
   NEW_AGENT_ENABLED: ${{ github.event.inputs.NEW_AGENT_ENABLED }}
   ```

### Agent Script Template

```javascript
/**
 * Agent Name - Description
 */

console.log('Agent starting...');
console.log('Environment:', process.env.NODE_ENV || 'development');

// Your agent logic here

console.log('Agent completed successfully.');
```

Note: The script is executed via `node` command in the workflow, so a shebang line is not required.

## Technical Details

### Environment Variables

- `NODE_ENV`: Controls the environment mode (production/development)
- `{AGENT}_ENABLED`: Individual flags for each agent

### Error Handling

- Agents run with `set -euo pipefail` for strict error handling
- Script not found: Records "failed" status and exits with 0 (doesn't fail the workflow job but shows as failed in status tracking)
- Agent execution failures: Write to status file but don't fail the overall workflow
- Each agent is independent and doesn't affect others
- Warnings are emitted to the Actions UI for visibility

### Status Tracking

Status files enable downstream processing:
- `success`: Agent ran and completed without errors
- `failed`: Agent encountered an error or script not found
- `skipped`: Agent was disabled via input toggle

## Troubleshooting

### Agent Not Running

1. Check if the agent is enabled in workflow inputs
2. Verify the script file exists at the expected path
3. Review the logs in the Actions UI for error messages

### Script Not Found Error

- Ensure the script path matches: `agents/{dir}/{dir}-agent.js`
- Verify the file was committed to the repository
- Check file permissions (should be readable)

### Execution Failures

- Review the agent's log file in the Actions artifacts
- Check for Node.js compatibility issues
- Ensure all required dependencies are installed

## Best Practices

1. **Independent Agents**: Each agent should be self-contained
2. **Idempotent**: Agents should handle re-runs gracefully
3. **Logging**: Use clear, structured logging for debugging
4. **Exit Codes**: Use proper exit codes (0 for success, non-zero for failure)
5. **Timeout**: Consider adding timeouts for long-running agents

## Future Enhancements

Potential improvements to consider:

- Add result aggregation step to summarize all agent statuses
- Upload log files as workflow artifacts
- Add retry logic for transient failures
- Implement agent dependencies (run certain agents only if others succeed)
- Add slack/email notifications for failures
- Support parallel vs. sequential execution modes
