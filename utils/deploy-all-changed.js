#!/usr/bin/env node
/**
 * utils/deploy-all-changed.js
 *
 * Detects changed agents, deploys each to Cloud Run, updates registry,
 * performs a health check, and logs results.
 *
 * Usage:
 *   node utils/deploy-all-changed.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const deployAgent = require('./deployAgent');
const updateRegistry = require('../scripts/update-registry');
const axios = require('axios');

// Config (can use env vars or GitHub Secrets in CI)
const AGENTS_DIR = path.resolve('agents');
const REGISTRY_FILE = path.resolve('registry/agents.json');
const HEALTH_ENDPOINT = '/invoke'; // Can be /metadata if implemented
const TEST_PAYLOAD = { input: 'health-check' };

// Helper: detect top-level agent folders
function getAgentFolders() {
  return fs.readdirSync(AGENTS_DIR).filter(f => {
    const fullPath = path.join(AGENTS_DIR, f);
    return fs.statSync(fullPath).isDirectory();
  });
}

// Helper: health check agent endpoint
async function healthCheck(url) {
  try {
    const res = await axios.post(url + HEALTH_ENDPOINT, TEST_PAYLOAD, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('\n🧩 Deploying changed agents to Cloud Run and updating registry...\n');

  const agents = getAgentFolders();

  for (const agentFolder of agents) {
    const agentPath = path.join(AGENTS_DIR, agentFolder);
    const metadataPath = path.join(agentPath, 'agent-metadata.json');

    if (!fs.existsSync(metadataPath)) {
      console.warn(`⚠️  Skipping ${agentFolder}: missing agent-metadata.json`);
      continue;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const serviceName = metadata.agentId;

    try {
      console.log(`\n🚀 Deploying agent: ${serviceName}`);

      // Deploy agent via utils/deployAgent.js
      const url = await deployAgent(agentPath, serviceName);

      console.log(`✅ Deployed ${serviceName} → ${url}`);

      // Update registry
      updateRegistry(metadataPath, url);

      // Health check
      const healthy = await healthCheck(url);
      if (!healthy) {
        console.error(`❌ Health check failed for ${serviceName} at ${url}`);
      } else {
        console.log(`🟢 Health check passed for ${serviceName}`);
      }
    } catch (err) {
      console.error(`❌ Deployment failed for ${serviceName}: ${err.message}`);
    }
  }

  console.log('\n✅ All agents processed.');
}

main();
