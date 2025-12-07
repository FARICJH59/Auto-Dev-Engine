/**
 * Auto-Dev-Engine Orchestrator - Phase 2 Pipeline
 * 
 * Main orchestration pipeline that coordinates agent execution,
 * manages workflows, and handles deployment automation.
 */

import express from 'express';
import { spawn } from 'child_process';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Configuration
const config = {
  environment: process.env.NODE_ENV || 'development',
  gcpProject: process.env.GCP_PROJECT_ID || '',
  gcpRegion: process.env.GCP_REGION || 'us-central1',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

// Agent registry
const agents = {
  codeAnalysis: { name: 'code-analysis', status: 'ready' },
  testGeneration: { name: 'test-generation', status: 'ready' },
  deployment: { name: 'deployment', status: 'ready' },
  monitoring: { name: 'monitoring', status: 'ready' },
};

/**
 * Execute an agent pipeline
 */
async function executeAgent(agentName, payload = {}) {
  console.log(`[Orchestrator] Executing agent: ${agentName}`);
  
  return new Promise((resolve, reject) => {
    // Simulate agent execution
    setTimeout(() => {
      resolve({
        agent: agentName,
        status: 'completed',
        timestamp: new Date().toISOString(),
        result: payload,
      });
    }, 1000);
  });
}

/**
 * Execute a pipeline of agents
 */
async function executePipeline(pipelineConfig) {
  console.log('[Orchestrator] Starting pipeline execution');
  const results = [];
  
  for (const step of pipelineConfig.steps) {
    try {
      const result = await executeAgent(step.agent, step.payload);
      results.push(result);
      console.log(`[Orchestrator] Step completed: ${step.agent}`);
    } catch (error) {
      console.error(`[Orchestrator] Step failed: ${step.agent}`, error);
      throw error;
    }
  }
  
  return {
    pipelineId: pipelineConfig.id || `pipeline-${Date.now()}`,
    status: 'completed',
    steps: results,
    completedAt: new Date().toISOString(),
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    version: '1.0.0',
  });
});

// Get orchestrator status
app.get('/status', (req, res) => {
  res.json({
    orchestrator: 'running',
    agents: Object.values(agents),
    config: {
      environment: config.environment,
      region: config.gcpRegion,
    },
    timestamp: new Date().toISOString(),
  });
});

// List available agents
app.get('/agents', (req, res) => {
  res.json({
    agents: Object.values(agents),
    count: Object.keys(agents).length,
  });
});

// Execute a single agent
app.post('/agents/:agentName/execute', async (req, res) => {
  const { agentName } = req.params;
  const payload = req.body;
  
  if (!agents[agentName]) {
    return res.status(404).json({ error: `Agent not found: ${agentName}` });
  }
  
  try {
    const result = await executeAgent(agentName, payload);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute a pipeline
app.post('/pipeline/execute', async (req, res) => {
  const pipelineConfig = req.body;
  
  if (!pipelineConfig.steps || !Array.isArray(pipelineConfig.steps)) {
    return res.status(400).json({ error: 'Invalid pipeline configuration' });
  }
  
  try {
    const result = await executePipeline(pipelineConfig);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Auto-Dev-Engine Orchestrator',
    version: '1.0.0',
    phase: 'Phase 2 - Pipeline Orchestration',
    endpoints: {
      health: '/health',
      status: '/status',
      agents: '/agents',
      executeAgent: 'POST /agents/:agentName/execute',
      executePipeline: 'POST /pipeline/execute',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Orchestrator] Server running on port ${PORT}`);
  console.log(`[Orchestrator] Environment: ${config.environment}`);
  console.log(`[Orchestrator] GCP Project: ${config.gcpProject || 'not configured'}`);
  console.log(`[Orchestrator] Agents loaded: ${Object.keys(agents).length}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Orchestrator] Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Orchestrator] Received SIGINT, shutting down gracefully');
  process.exit(0);
});
