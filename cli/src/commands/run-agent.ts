import { spawn } from 'child_process';
import * as path from 'path';

interface RunOptions {
  tenant?: string;
  project?: string;
}

export async function runAgentCommand(agent: string, options: RunOptions) {
  console.log(`🤖 Running agent: ${agent}\n`);

  const tenantId = options.tenant || 'default-tenant';
  const projectId = options.project || 'default-project';

  console.log(`Tenant: ${tenantId}`);
  console.log(`Project: ${projectId}\n`);

  const agentPath = path.join(process.cwd(), 'agents', agent, `${agent}-agent.js`);

  return new Promise<void>((resolve, reject) => {
    const agentProcess = spawn('node', [agentPath], {
      env: {
        ...process.env,
        TENANT_ID: tenantId,
        PROJECT_ID: projectId,
        AGENT_NAME: agent
      },
      stdio: 'inherit'
    });

    agentProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Agent ${agent} completed successfully`);
        resolve();
      } else {
        console.error(`\n❌ Agent ${agent} failed with code ${code}`);
        reject(new Error(`Agent failed with code ${code}`));
      }
    });

    agentProcess.on('error', (error) => {
      console.error(`\n❌ Error running agent:`, error);
      reject(error);
    });
  });
}
