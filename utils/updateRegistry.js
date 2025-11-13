const fs = require('fs');
const path = require('path');

function updateRegistry(agentMetadata) {
  const registryPath = path.resolve('registry/agents.json');
  const registry = fs.existsSync(registryPath) ? JSON.parse(fs.readFileSync(registryPath)) : [];
  const index = registry.findIndex(a => a.agentId === agentMetadata.agentId);
  if (index > -1) registry[index] = agentMetadata;
  else registry.push(agentMetadata);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

module.exports = updateRegistry;
