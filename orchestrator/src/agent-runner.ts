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
 * Load manifest files from /manifests directory
 */
async function loadManifests(): Promise<Record<string, Manifest>> {
  const manifestDir = path.join(process.cwd(), 'manifests');
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
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logDir = path.join(process.cwd(), 'logs', timestamp);
  const logFile = path.join(logDir, `${agent}.log`);
  const statusFile = path.join(logDir, `${agent}.status`);

  // Create log directory
  await fs.mkdir(logDir, { recursive: true });

  // Load manifests
  const manifests = await loadManifests();
  const agentsConfig = manifests.agents?.agents || {};

  // Check if agent is enabled
  if (agentsConfig[agent] && !agentsConfig[agent].enabled) {
    const result: AgentResult = {
      status: 'skipped',
      output: 'Agent is disabled in configuration',
      timestamp
    };
    await fs.writeFile(statusFile, 'skipped');
    logger.info(`Agent ${agent} skipped (disabled)`);
    return result;
  }

  // Execute agent
  const agentPath = path.join(process.cwd(), 'agents', agent, `${agent}-agent.js`);

  return new Promise((resolve) => {
    let output = '';
    let error = '';

    const agentProcess = spawn('node', [agentPath], {
      env: {
        ...process.env,
        TENANT_ID: tenantId,
        PROJECT_ID: projectId,
        AGENT_NAME: agent
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

      logger.info(`Agent ${agent} completed`, { status, code });
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

      logger.error(`Agent ${agent} error`, { error: err });
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
  const logsDir = path.join(process.cwd(), 'logs');

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
