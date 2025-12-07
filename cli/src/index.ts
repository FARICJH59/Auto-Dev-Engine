#!/usr/bin/env node

import { runAgentCommand } from './commands/run-agent.js';
import { pipelineCommand } from './commands/pipeline.js';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Auto Dev Engine CLI');
  console.log('\nUsage:');
  console.log('  ade run <agent>          Run a single agent');
  console.log('  ade pipeline <pipeline>  Run a pipeline of agents');
  console.log('\nExamples:');
  console.log('  ade run lsas');
  console.log('  ade pipeline default');
  process.exit(0);
}

const command = args[0];
const commandArg = args[1];

switch (command) {
  case 'run':
    if (!commandArg) {
      console.error('Error: Agent name is required');
      console.log('Usage: ade run <agent>');
      process.exit(1);
    }
    runAgentCommand(commandArg);
    break;
    
  case 'pipeline':
    if (!commandArg) {
      console.error('Error: Pipeline name is required');
      console.log('Usage: ade pipeline <pipelineName>');
      process.exit(1);
    }
    pipelineCommand(commandArg);
    break;
    
  default:
    console.error(`Unknown command: ${command}`);
    console.log('Available commands: run, pipeline');
    process.exit(1);
}
