#!/usr/bin/env node

const { Command } = require('commander');
const { initCommand } = require('../dist/commands/init');
const { deployCommand } = require('../dist/commands/deploy');
const { runAgentCommand } = require('../dist/commands/run-agent');

const program = new Command();

program
  .name('ade')
  .description('Auto-Dev-Engine CLI - DevOps automation platform')
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('Initialize a new Auto-Dev-Engine project')
  .action(initCommand);

// Deploy commands
const deploy = program.command('deploy').description('Deploy services');

deploy
  .command('cloudrun')
  .description('Deploy orchestrator to Google Cloud Run')
  .action(() => deployCommand('cloudrun'));

deploy
  .command('vercel')
  .description('Deploy UI to Vercel')
  .action(() => deployCommand('vercel'));

// Run agent command
program
  .command('run <agent>')
  .description('Run a specific agent')
  .option('-t, --tenant <tenantId>', 'Tenant ID')
  .option('-p, --project <projectId>', 'Project ID')
  .action(runAgentCommand);

// Pipeline command
program
  .command('pipeline <name>')
  .description('Execute a named pipeline')
  .option('-t, --tenant <tenantId>', 'Tenant ID')
  .option('-p, --project <projectId>', 'Project ID')
  .action((name, options) => {
    console.log(`Executing pipeline: ${name}`);
    console.log('Options:', options);
    console.log('Pipeline execution not yet implemented');
  });

program.parse();
