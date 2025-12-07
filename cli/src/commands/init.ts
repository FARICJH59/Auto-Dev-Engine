import { promises as fs } from 'fs';
import * as path from 'path';

export async function initCommand() {
  console.log('🚀 Initializing Auto-Dev-Engine project...\n');

  try {
    // Create project structure
    const directories = [
      'agents',
      'manifests',
      'logs',
      '.github/workflows'
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }

    // Create default manifest files if they don't exist
    const manifestsDir = 'manifests';

    // project.yaml
    const projectYaml = `projectId: my-project
cloud:
  primary: gcp
  region: us-central1
vercel:
  project: my-project-ui
`;

    // agents.yaml
    const agentsYaml = `agents:
  lsas:
    enabled: true
  pulse:
    enabled: true
  parso:
    enabled: true
  gemini:
    enabled: true
`;

    // cloudrun.yaml
    const cloudrunYaml = `service: orchestrator
runtime: node20
cpu: 1
memory: 512Mi
minInstances: 0
maxInstances: 3
`;

    // vercel.json
    const vercelJson = `{
  "version": 2,
  "builds": [
    {
      "src": "orchestrator/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "orchestrator/src/index.ts"
    }
  ]
}
`;

    const files = [
      { name: 'project.yaml', content: projectYaml },
      { name: 'agents.yaml', content: agentsYaml },
      { name: 'cloudrun.yaml', content: cloudrunYaml },
      { name: 'vercel.json', content: vercelJson }
    ];

    for (const file of files) {
      const filePath = path.join(manifestsDir, file.name);
      try {
        await fs.access(filePath);
        console.log(`⊘ Skipped (already exists): ${filePath}`);
      } catch {
        await fs.writeFile(filePath, file.content);
        console.log(`✓ Created: ${filePath}`);
      }
    }

    console.log('\n✅ Auto-Dev-Engine project initialized successfully!');
    console.log('\nNext steps:');
    console.log('  1. Review and customize manifests in ./manifests');
    console.log('  2. Create your agents in ./agents directory');
    console.log('  3. Deploy with: ade deploy cloudrun');
  } catch (error) {
    console.error('❌ Error initializing project:', error);
    process.exit(1);
  }
}
