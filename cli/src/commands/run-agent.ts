import { runAgent } from '../../../orchestrator/src/agent-runner.js';
import fs from 'fs';

/**
 * Execute the 'ade run <agent>' command
 * @param agentName - Name of the agent to run
 */
export async function runAgentCommand(agentName: string): Promise<void> {
  console.log(`Starting agent: ${agentName}`);
  
  try {
    const result = await runAgent(agentName);
    
    // Show real-time logs
    if (fs.existsSync(result.logFile)) {
      console.log('\n--- Agent Log ---');
      const logContent = fs.readFileSync(result.logFile, 'utf8');
      console.log(logContent);
      console.log('--- End Log ---\n');
    }
    
    if (result.success) {
      console.log(`✓ Agent '${agentName}' completed successfully`);
      console.log(`Log file: ${result.logFile}`);
      process.exit(0);
    } else {
      console.error(`✗ Agent '${agentName}' failed: ${result.error}`);
      console.log(`Log file: ${result.logFile}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error running agent '${agentName}':`, error);
    process.exit(1);
  }
}
