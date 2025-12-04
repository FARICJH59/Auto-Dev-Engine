import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export const healthRouter = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: CheckResult;
    cache: CheckResult;
    storage: CheckResult;
  };
}

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  latency?: number;
  message?: string;
}

// Liveness probe - basic check that the service is running
healthRouter.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe - check if service is ready to accept traffic
healthRouter.get('/ready', async (req: Request, res: Response) => {
  try {
    const checks = await performHealthChecks();
    const allPassed = Object.values(checks).every(c => c.status === 'pass');
    
    res.status(allPassed ? 200 : 503).json({
      status: allPassed ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks
    });
  } catch (error) {
    logger.error({ error }, 'Readiness check failed');
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Full health check
healthRouter.get('/', async (req: Request, res: Response) => {
  try {
    const checks = await performHealthChecks();
    const allPassed = Object.values(checks).every(c => c.status === 'pass');
    const hasFailed = Object.values(checks).some(c => c.status === 'fail');
    
    const healthStatus: HealthStatus = {
      status: hasFailed ? 'unhealthy' : (allPassed ? 'healthy' : 'degraded'),
      timestamp: new Date().toISOString(),
      version: process.env.VERSION || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      checks
    };
    
    res.status(hasFailed ? 503 : 200).json(healthStatus);
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

async function performHealthChecks(): Promise<HealthStatus['checks']> {
  const [database, cache, storage] = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkStorage()
  ]);
  
  return { database, cache, storage };
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Placeholder for actual database check
    // const result = await db.query('SELECT 1');
    return {
      status: 'pass',
      latency: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'fail',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkCache(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Placeholder for actual cache check
    // await redis.ping();
    return {
      status: 'pass',
      latency: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'fail',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkStorage(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Placeholder for actual storage check
    return {
      status: 'pass',
      latency: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'fail',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
