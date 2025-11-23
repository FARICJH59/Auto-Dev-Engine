#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table3');

const registry = JSON.parse(fs.readFileSync(path.resolve('registry/agents.json'), 'utf8'));

const table = new Table({ head: ['Agent ID', 'Domain', 'Cloud', 'Status'] });
registry.forEach(agent => table.push([agent.agentId, agent.domain, agent.cloud, '🟢 Ready']));
console.log(table.toString());
