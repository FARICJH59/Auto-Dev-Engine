import express, { Express, Request, Response } from 'express';
import { router } from './router';
import winston from 'winston';

const app: Express = express();
const port = process.env.PORT || 8080;

// Configure logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/orchestrator.log' })
  ]
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query
  });
  next();
});

// Routes
app.use('/', router);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  logger.info(`Orchestrator running on port ${port}`);
  console.log(`🚀 Orchestrator running on port ${port}`);
});

export default app;
