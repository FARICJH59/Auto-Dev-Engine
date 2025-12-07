import { runAgent, isAgentEnabled, skipAgent } from '../agent-runner.js';
import fs from 'fs';
import path from 'path';

describe('Agent Runner', () => {
  const testTimestamp = 'test-' + Date.now();

  afterAll(() => {
    // Cleanup test logs
    const logDir = path.join(process.cwd(), 'logs', testTimestamp);
    if (fs.existsSync(logDir)) {
      fs.rmSync(logDir, { recursive: true });
    }
  });

  describe('isAgentEnabled', () => {
    it('should return true for enabled agent', () => {
      const config = {
        agents: {
          lsas: { enabled: true, parallel: true }
        }
      };
      expect(isAgentEnabled('lsas', config)).toBe(true);
    });

    it('should return false for disabled agent', () => {
      const config = {
        agents: {
          lsas: { enabled: false, parallel: true }
        }
      };
      expect(isAgentEnabled('lsas', config)).toBe(false);
    });

    it('should return false for non-existent agent', () => {
      const config = {
        agents: {
          lsas: { enabled: true, parallel: true }
        }
      };
      expect(isAgentEnabled('nonexistent', config)).toBe(false);
    });
  });

  describe('skipAgent', () => {
    it('should create skip status file', () => {
      skipAgent('test-agent', testTimestamp, 'Not enabled');
      
      const logDir = path.join(process.cwd(), 'logs', testTimestamp);
      const skipFile = path.join(logDir, 'test-agent.skipped');
      
      expect(fs.existsSync(skipFile)).toBe(true);
      const content = fs.readFileSync(skipFile, 'utf8');
      expect(content).toContain('Agent skipped: Not enabled');
    });
  });

  describe('runAgent', () => {
    it('should fail when agent script does not exist', async () => {
      const result = await runAgent('nonexistent-agent', testTimestamp);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      
      const logDir = path.join(process.cwd(), 'logs', testTimestamp);
      const failedFile = path.join(logDir, 'nonexistent-agent.failed');
      expect(fs.existsSync(failedFile)).toBe(true);
    });

    it('should succeed when agent script exists and runs successfully', async () => {
      const result = await runAgent('lsas', testTimestamp);
      
      expect(result.success).toBe(true);
      expect(result.agentName).toBe('lsas');
      
      const logDir = path.join(process.cwd(), 'logs', testTimestamp);
      const successFile = path.join(logDir, 'lsas.success');
      expect(fs.existsSync(successFile)).toBe(true);
      
      const logFile = path.join(logDir, 'lsas.log');
      expect(fs.existsSync(logFile)).toBe(true);
    }, 10000); // Increase timeout for agent execution
  });
});
