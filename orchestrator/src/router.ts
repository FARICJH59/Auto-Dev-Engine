import { Router, Request, Response } from 'express';
import { runAgent, getAgentStatus, startPipeline } from './agent-runner';
import { logger } from './index';

export const router = Router();

/**
 * Validate input string format
 */
function validateInput(value: string, fieldName: string, maxLength: number = 100): void {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  if (value.length === 0 || value.length > maxLength) {
    throw new Error(`${fieldName} must be between 1 and ${maxLength} characters`);
  }
  // Only allow alphanumeric, hyphens, underscores, and dots
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
    throw new Error(`${fieldName} contains invalid characters. Only alphanumeric, hyphens, underscores, and dots are allowed.`);
  }
}

/**
 * POST /run
 * Execute a single agent
 * Body: { tenantId, projectId, agent }
 */
router.post('/run', async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId, agent } = req.body;

    if (!tenantId || !projectId || !agent) {
      return res.status(400).json({
        error: 'Missing required fields: tenantId, projectId, agent'
      });
    }

    // Validate inputs
    try {
      validateInput(tenantId, 'tenantId');
      validateInput(projectId, 'projectId');
      validateInput(agent, 'agent', 50);
    } catch (validationError) {
      return res.status(400).json({
        error: validationError instanceof Error ? validationError.message : 'Validation error'
      });
    }

    logger.info('Running agent', { tenantId, projectId, agent });

    const result = await runAgent(tenantId, projectId, agent);

    res.json({
      success: true,
      agent,
      result
    });
  } catch (error) {
    logger.error('Error running agent', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /status/:agent
 * Get status of an agent execution
 */
router.get('/status/:agent', async (req: Request, res: Response) => {
  try {
    const { agent } = req.params;
    const status = await getAgentStatus(agent);

    res.json({
      agent,
      status
    });
  } catch (error) {
    logger.error('Error getting agent status', { error });
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /pipeline/start
 * Start a pipeline with multiple agents
 * Body: { tenantId, projectId, pipeline, agents[] }
 */
router.post('/pipeline/start', async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId, pipeline, agents } = req.body;

    if (!tenantId || !projectId || !pipeline || !agents) {
      return res.status(400).json({
        error: 'Missing required fields: tenantId, projectId, pipeline, agents'
      });
    }

    // Validate inputs
    try {
      validateInput(tenantId, 'tenantId');
      validateInput(projectId, 'projectId');
      validateInput(pipeline, 'pipeline');
      
      if (!Array.isArray(agents)) {
        throw new Error('agents must be an array');
      }
      if (agents.length === 0 || agents.length > 20) {
        throw new Error('agents array must contain between 1 and 20 items');
      }
      
      // Validate each agent name
      agents.forEach((agent, index) => {
        validateInput(agent, `agents[${index}]`, 50);
      });
    } catch (validationError) {
      return res.status(400).json({
        error: validationError instanceof Error ? validationError.message : 'Validation error'
      });
    }

    logger.info('Starting pipeline', { tenantId, projectId, pipeline, agents });

    const result = await startPipeline(tenantId, projectId, pipeline, agents);

    res.json({
      success: true,
      pipeline,
      result
    });
  } catch (error) {
    logger.error('Error starting pipeline', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
