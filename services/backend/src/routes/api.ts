import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export const apiRouter = Router();

// API version info
apiRouter.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Auto-Dev-Engine API',
    version: process.env.VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Example endpoint
apiRouter.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'operational',
    cloud: {
      provider: process.env.CLOUD_PROVIDER || 'unknown',
      region: process.env.CLOUD_REGION || 'unknown'
    },
    uptime: process.uptime()
  });
});
