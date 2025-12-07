import { Router, Request, Response } from 'express';
import { runAgent, getAgentStatus, startPipeline } from './agent-runner';
import { logger } from './index';

export const router = Router();

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
