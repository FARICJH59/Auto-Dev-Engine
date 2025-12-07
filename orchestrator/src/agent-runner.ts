import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { logger } from './index';

interface Manifest {
  projectId?: string;
  agents?: Record<string, { enabled: boolean }>;
  cloud?: {
    primary: string;
    region: string;
  };
}

interface AgentResult {
  status: 'success' | 'failed' | 'skipped';
  output?: string;
  error?: string;
  timestamp: string;
}

interface PipelineResult {
  agents: Record<string, AgentResult>;
  overallStatus: 'success' | 'failed' | 'partial';
}

/**
 * Get the project root directory
 * Can be configured via PROJECT_ROOT environment variable
 */
function getProjectRoot(): string {
  if (process.env.PROJECT_ROOT) {
    return path.resolve(process.env.PROJECT_ROOT);
  }
  // Default to parent directory of orchestrator
  return path.resolve(process.cwd(), '..');
}

/**
 * Validate and sanitize agent name to prevent path traversal
 */
function validateAgentName(agent: string): string {
  // Only allow alphanumeric characters, hyphens, and underscores
  const sanitized = agent.replace(/[^a-zA-Z0-9_-]/g, '');
  
  if (sanitized !== agent) {
    throw new Error(`Invalid agent name: ${agent}. Only alphanumeric, hyphens, and underscores are allowed.`);
  }
  
  if (sanitized.length === 0 || sanitized.length > 50) {
    throw new Error(`Agent name must be between 1 and 50 characters`);
  }
  
  return sanitized;
}

/**
 * Load manifest files from /manifests directory
 */
async function loadManifests(): Promise<Record<string, Manifest>> {
  const manifestDir = path.join(getProjectRoot(), 'manifests');
  const manifests: Record<string, Manifest> = {};

  try {
    const files = ['project.yaml', 'agents.yaml', 'cloudrun.yaml'];

    for (const file of files) {
      try {
        const filePath = path.join(manifestDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = YAML.parse(content);
        manifests[file.replace('.yaml', '')] = parsed;
      } catch (error) {
        logger.warn(`Could not load manifest ${file}`, { error });
      }
    }
  } catch (error) {
    logger.error('Error loading manifests', { error });
  }

  return manifests;
}

/**
 * Execute an agent by calling its script
 */
export async function runAgent(
  tenantId: string,
  projectId: string,
  agent: string
): Promise<AgentResult> {
  // Validate and sanitize agent name to prevent path traversal
  const validatedAgent = validateAgentName(agent);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logDir = path.join(getProjectRoot(), 'logs', timestamp);
  const logFile = path.join(logDir, `${validatedAgent}.log`);
  const statusFile = path.join(logDir, `${validatedAgent}.status`);

  // Create log directory
  await fs.mkdir(logDir, { recursive: true });

  // Load manifests
  const manifests = await loadManifests();
  const agentsConfig = manifests.agents?.agents || {};

  // Check if agent is enabled
  if (agentsConfig[validatedAgent] && !agentsConfig[validatedAgent].enabled) {
    const result: AgentResult = {
      status: 'skipped',
      output: 'Agent is disabled in configuration',
      timestamp
    };
    await fs.writeFile(statusFile, 'skipped');
    logger.info(`Agent ${validatedAgent} skipped (disabled)`);
    return result;
  }

  // Execute agent
  // Use validated agent name in path construction
  const agentPath = path.join(getProjectRoot(), 'agents', validatedAgent, `${validatedAgent}-agent.js`);

  return new Promise((resolve) => {
    let output = '';
    let error = '';

    const agentProcess = spawn('node', [agentPath], {
      env: {
        ...process.env,
        TENANT_ID: tenantId,
        PROJECT_ID: projectId,
        AGENT_NAME: validatedAgent
      }
    });

    agentProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    agentProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    agentProcess.on('close', async (code) => {
      const status = code === 0 ? 'success' : 'failed';
      const result: AgentResult = {
        status,
        output,
        error: error || undefined,
        timestamp
      };

      // Write logs
      await fs.writeFile(logFile, `${output}\n${error}`);
      await fs.writeFile(statusFile, status);

      logger.info(`Agent ${validatedAgent} completed`, { status, code });
      resolve(result);
    });

    agentProcess.on('error', async (err) => {
      const result: AgentResult = {
        status: 'failed',
        error: err.message,
        timestamp
      };

      await fs.writeFile(logFile, err.message);
      await fs.writeFile(statusFile, 'failed');

      logger.error(`Agent ${validatedAgent} error`, { error: err });
      resolve(result);
    });
  });
}

/**
 * Get the status of an agent execution
 */
export async function getAgentStatus(agent: string): Promise<{
  status: string;
  lastRun?: string;
}> {
  const logsDir = path.join(getProjectRoot(), 'logs');

  try {
    // Find the most recent status file for this agent
    const timestamps = await fs.readdir(logsDir);
    const sortedTimestamps = timestamps.sort().reverse();

    for (const timestamp of sortedTimestamps) {
      const statusFile = path.join(logsDir, timestamp, `${agent}.status`);
      try {
        const status = await fs.readFile(statusFile, 'utf-8');
        return {
          status: status.trim(),
          lastRun: timestamp
        };
      } catch {
        continue;
      }
    }

    return { status: 'unknown' };
  } catch (error) {
    logger.error('Error getting agent status', { error });
    return { status: 'unknown' };
  }
}

/**
 * Start a pipeline with multiple agents
 */
export async function startPipeline(
  tenantId: string,
  projectId: string,
  pipeline: string,
  agents: string[]
): Promise<PipelineResult> {
  logger.info(`Starting pipeline ${pipeline}`, { agents });

  const results: Record<string, AgentResult> = {};
  let hasFailure = false;

  for (const agent of agents) {
    logger.info(`Running agent ${agent} in pipeline ${pipeline}`);
    const result = await runAgent(tenantId, projectId, agent);
    results[agent] = result;

    if (result.status === 'failed') {
      hasFailure = true;
      logger.warn(`Agent ${agent} failed in pipeline ${pipeline}`);
    }
  }

  const overallStatus = hasFailure
    ? Object.values(results).some(r => r.status === 'success')
      ? 'partial'
      : 'failed'
    : 'success';

  return {
    agents: results,
    overallStatus
  };
}
