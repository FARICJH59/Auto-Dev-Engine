import { runNamedPipeline } from '../../../orchestrator/src/pipeline.js';

/**
 * Execute the 'ade pipeline <pipelineName>' command
 * @param pipelineName - Name of the pipeline to run
 */
export async function pipelineCommand(pipelineName: string): Promise<void> {
  console.log(`Starting pipeline: ${pipelineName}`);
  
  try {
    const result = await runNamedPipeline(pipelineName);
    
    console.log('\n--- Pipeline Results ---');
    console.log(`Pipeline: ${result.pipelineName}`);
    console.log(`Timestamp: ${result.timestamp}`);
    console.log(`Total Agents: ${result.totalAgents}`);
    console.log(`Success: ${result.successCount}`);
    console.log(`Failed: ${result.failedCount}`);
    console.log(`Skipped: ${result.skippedCount}`);
    console.log('\nAgent Details:');
    
    result.agents.forEach(agent => {
      const status = agent.success ? '✓' : '✗';
      const msg = agent.success ? 'SUCCESS' : `FAILED: ${agent.error}`;
      console.log(`  ${status} ${agent.agentName}: ${msg}`);
      console.log(`     Log: ${agent.logFile}`);
    });
    
    console.log('--- End Pipeline Results ---\n');
    
    if (result.success) {
      console.log(`✓ Pipeline '${pipelineName}' completed successfully`);
      process.exit(0);
    } else {
      console.error(`✗ Pipeline '${pipelineName}' completed with failures`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error running pipeline '${pipelineName}':`, error);
    process.exit(1);
  }
}
