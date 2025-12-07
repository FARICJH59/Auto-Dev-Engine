import { runAgent, isAgentEnabled, skipAgent, AgentResult, AgentsConfig } from './agent-runner.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface PipelinesConfig {
  pipelines: {
    [pipelineName: string]: string[];
  };
}

export interface PipelineResult {
  pipelineName: string;
  timestamp: string;
  agents: AgentResult[];
  success: boolean;
  totalAgents: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
}

/**
 * Load agents configuration from agents.yaml
 * @returns Parsed agents configuration
 */
function loadAgentsConfig(): AgentsConfig {
  const projectRoot = process.cwd();
  const agentsConfigPath = path.join(projectRoot, 'agents.yaml');
  
  if (!fs.existsSync(agentsConfigPath)) {
    throw new Error(`agents.yaml not found at ${agentsConfigPath}`);
  }
  
  const fileContents = fs.readFileSync(agentsConfigPath, 'utf8');
  return yaml.load(fileContents) as AgentsConfig;
}

/**
 * Load pipelines configuration from pipelines.yaml
 * @returns Parsed pipelines configuration
 */
function loadPipelinesConfig(): PipelinesConfig {
  const projectRoot = process.cwd();
  const pipelinesConfigPath = path.join(projectRoot, 'pipelines.yaml');
  
  if (!fs.existsSync(pipelinesConfigPath)) {
    throw new Error(`pipelines.yaml not found at ${pipelinesConfigPath}`);
  }
  
  const fileContents = fs.readFileSync(pipelinesConfigPath, 'utf8');
  return yaml.load(fileContents) as PipelinesConfig;
}

/**
 * Run a pipeline of agents
 * @param agentList - List of agent names to run
 * @param parallel - Whether to run agents in parallel (default: true)
 * @param logTimestamp - Optional timestamp for log directory
 * @returns Promise<AgentResult[]> with results for each agent
 */
export async function runPipeline(
  agentList: string[],
  parallel: boolean = true,
  logTimestamp?: string
): Promise<AgentResult[]> {
  const timestamp = logTimestamp || Date.now().toString();
  const agentsConfig = loadAgentsConfig();
  const results: AgentResult[] = [];

  if (parallel) {
    // Run all agents in parallel
    const promises = agentList.map(async (agentName) => {
      if (isAgentEnabled(agentName, agentsConfig)) {
        return await runAgent(agentName, timestamp);
      } else {
        skipAgent(agentName, timestamp, 'Agent is not enabled');
        return {
          agentName,
          success: false,
          logFile: path.join('logs', timestamp, `${agentName}.log`),
          error: 'Agent is not enabled'
        };
      }
    });
    
    return await Promise.all(promises);
  } else {
    // Run agents sequentially
    for (const agentName of agentList) {
      if (isAgentEnabled(agentName, agentsConfig)) {
        const result = await runAgent(agentName, timestamp);
        results.push(result);
      } else {
        skipAgent(agentName, timestamp, 'Agent is not enabled');
        results.push({
          agentName,
          success: false,
          logFile: path.join('logs', timestamp, `${agentName}.log`),
          error: 'Agent is not enabled'
        });
      }
    }
    return results;
  }
}

/**
 * Run a named pipeline from pipelines.yaml
 * @param pipelineName - Name of the pipeline to run
 * @returns Promise<PipelineResult> with aggregated results
 */
export async function runNamedPipeline(pipelineName: string): Promise<PipelineResult> {
  const pipelinesConfig = loadPipelinesConfig();
  const agentList = pipelinesConfig?.pipelines?.[pipelineName];
  
  if (!agentList || !Array.isArray(agentList)) {
    throw new Error(`Pipeline '${pipelineName}' not found in pipelines.yaml`);
  }

  const timestamp = Date.now().toString();
  const agentsConfig = loadAgentsConfig();
  
  // Determine if pipeline should run in parallel
  // Check if any agent has parallel: false, if so run sequentially
  let parallel = true;
  for (const agentName of agentList) {
    if (agentsConfig?.agents?.[agentName]?.parallel === false) {
      parallel = false;
      break;
    }
  }

  const agents = await runPipeline(agentList, parallel, timestamp);
  
  // Aggregate results
  const successCount = agents.filter(a => a.success).length;
  const failedCount = agents.filter(a => !a.success && a.error && !a.error.includes('not enabled')).length;
  const skippedCount = agents.filter(a => !a.success && a.error && a.error.includes('not enabled')).length;
  
  return {
    pipelineName,
    timestamp,
    agents,
    success: failedCount === 0,
    totalAgents: agents.length,
    successCount,
    failedCount,
    skippedCount
  };
}
