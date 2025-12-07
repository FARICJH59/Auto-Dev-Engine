import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface AgentResult {
  agentName: string;
  success: boolean;
  logFile: string;
  error?: string;
}

export interface AgentConfig {
  enabled: boolean;
  parallel: boolean;
}

export interface AgentsConfig {
  agents: {
    [agentName: string]: AgentConfig;
  };
}

/**
 * Run a single agent and capture its output
 * @param agentName - Name of the agent to run
 * @param logTimestamp - Optional timestamp for log directory (defaults to current time)
 * @returns Promise<AgentResult> with execution details
 */
export async function runAgent(agentName: string, logTimestamp?: string): Promise<AgentResult> {
  const timestamp = logTimestamp || Date.now().toString();
  const projectRoot = process.cwd();
  const logDir = path.join(projectRoot, 'logs', timestamp);
  
  // Create log directory
  fs.mkdirSync(logDir, { recursive: true });
  
  const logFile = path.join(logDir, `${agentName}.log`);
  const agentScript = path.join(projectRoot, 'agents', agentName, `${agentName}-agent.js`);

  // Check if agent script exists
  if (!fs.existsSync(agentScript)) {
    const errorMsg = `Agent script not found: ${agentScript}\n`;
    fs.writeFileSync(logFile, errorMsg);
    fs.writeFileSync(path.join(logDir, `${agentName}.failed`), errorMsg);
    return {
      agentName,
      success: false,
      logFile,
      error: `Agent ${agentName} not found`
    };
  }

  return new Promise<AgentResult>((resolve) => {
    const proc = execFile('node', [agentScript], { cwd: projectRoot }, (err, stdout, stderr) => {
      // Write stdout and stderr to log file
      let logContent = '';
      if (stdout) {
        logContent += stdout;
      }
      if (stderr) {
        logContent += stderr;
      }
      fs.appendFileSync(logFile, logContent);

      if (err) {
        // Agent failed
        fs.writeFileSync(path.join(logDir, `${agentName}.failed`), `Exit code: ${err.code}\n${logContent}`);
        resolve({
          agentName,
          success: false,
          logFile,
          error: err.message
        });
      } else {
        // Agent succeeded
        fs.writeFileSync(path.join(logDir, `${agentName}.success`), `Agent completed successfully\n${logContent}`);
        resolve({
          agentName,
          success: true,
          logFile
        });
      }
    });
  });
}

/**
 * Check if an agent is enabled in the agents.yaml manifest
 * @param agentName - Name of the agent to check
 * @param agentsConfig - Parsed agents.yaml configuration
 * @returns boolean indicating if agent is enabled
 */
export function isAgentEnabled(agentName: string, agentsConfig: AgentsConfig): boolean {
  return agentsConfig?.agents?.[agentName]?.enabled === true;
}

/**
 * Mark an agent as skipped
 * @param agentName - Name of the agent
 * @param logTimestamp - Timestamp for log directory
 * @param reason - Reason for skipping
 */
export function skipAgent(agentName: string, logTimestamp: string, reason: string): void {
  const projectRoot = process.cwd();
  const logDir = path.join(projectRoot, 'logs', logTimestamp);
  fs.mkdirSync(logDir, { recursive: true });
  
  const logFile = path.join(logDir, `${agentName}.log`);
  const skipMsg = `Agent skipped: ${reason}\n`;
  fs.writeFileSync(logFile, skipMsg);
  fs.writeFileSync(path.join(logDir, `${agentName}.skipped`), skipMsg);
}
