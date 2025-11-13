const { execSync } = require('child_process');
const path = require('path');

function deployAgent(agentPath, vercelToken) {
  const fullPath = path.resolve(agentPath);
  console.log(`Deploying ${agentPath}...`);
  execSync(`cd ${fullPath} && vercel --prod --token=${vercelToken}`, { stdio: 'inherit' });
}

module.exports = deployAgent;
