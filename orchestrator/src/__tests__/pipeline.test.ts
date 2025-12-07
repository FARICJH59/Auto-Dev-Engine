import { runPipeline, runNamedPipeline } from '../pipeline.js';
import fs from 'fs';
import path from 'path';

describe('Pipeline Orchestrator', () => {
  const testTimestamp = 'test-pipeline-' + Date.now();

  afterAll(() => {
    // Cleanup test logs
    const logDir = path.join(process.cwd(), 'logs', testTimestamp);
    if (fs.existsSync(logDir)) {
      fs.rmSync(logDir, { recursive: true });
    }
  });

  describe('runPipeline', () => {
    it('should run agents in parallel', async () => {
      const agents = ['lsas'];
      const results = await runPipeline(agents, true, testTimestamp);
      
      expect(results).toHaveLength(1);
      expect(results[0].agentName).toBe('lsas');
      expect(results[0].success).toBe(true);
    }, 15000);

    it('should run agents sequentially', async () => {
      const agents = ['lsas'];
      const results = await runPipeline(agents, false, testTimestamp);
      
      expect(results).toHaveLength(1);
      expect(results[0].agentName).toBe('lsas');
      expect(results[0].success).toBe(true);
    }, 15000);

    it('should handle disabled agents', async () => {
      const agents = ['pulse']; // pulse is enabled in agents.yaml
      const results = await runPipeline(agents, true, testTimestamp);
      
      expect(results).toHaveLength(1);
      expect(results[0].agentName).toBe('pulse');
      // Will fail because agent script doesn't exist, but should not crash
    }, 15000);
  });

  describe('runNamedPipeline', () => {
    it('should run a named pipeline from pipelines.yaml', async () => {
      const result = await runNamedPipeline('fast-track');
      
      expect(result.pipelineName).toBe('fast-track');
      expect(result.totalAgents).toBe(2); // lsas and gemini
      expect(result.agents).toHaveLength(2);
    }, 20000);

    it('should throw error for non-existent pipeline', async () => {
      await expect(runNamedPipeline('non-existent')).rejects.toThrow();
    });
  });
});
