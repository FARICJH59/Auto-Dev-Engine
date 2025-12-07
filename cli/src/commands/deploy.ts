import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';

interface CloudRunConfig {
  service?: string;
  region?: string;
  memory?: string;
  cpu?: number | string;
  runtime?: string;
  minInstances?: number;
  maxInstances?: number;
}

interface VercelConfig {
  version?: number;
  builds?: Array<{ src: string; use: string }>;
  routes?: Array<{ src: string; dest: string }>;
  project?: string;
}

export async function deployCommand(target: string) {
  console.log(`🚀 Deploying to ${target}...\n`);

  try {
    if (target === 'cloudrun') {
      await deployCloudRun();
    } else if (target === 'vercel') {
      await deployVercel();
    } else {
      console.error(`❌ Unknown deployment target: ${target}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Deployment failed:`, error);
    process.exit(1);
  }
}

async function deployCloudRun() {
  console.log('📦 Building orchestrator...');

  // Load cloudrun.yaml
  const manifestPath = path.join(process.cwd(), 'manifests', 'cloudrun.yaml');
  let config: CloudRunConfig = {};

  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    config = YAML.parse(content) as CloudRunConfig;
  } catch (error) {
    console.warn('⚠️  Could not load cloudrun.yaml, using defaults');
  }

  const service = config.service || 'orchestrator';
  const region = config.region || 'us-central1';
  const memory = config.memory || '512Mi';
  const cpu = config.cpu || '1';

  console.log(`Service: ${service}`);
  console.log(`Region: ${region}`);
  console.log(`Memory: ${memory}`);
  console.log(`CPU: ${cpu}\n`);

  // Build Docker image
  console.log('🐳 Building Docker image...');
  console.log('Note: Actual deployment requires gcloud CLI and proper configuration');
  console.log('\nTo deploy manually, run:');
  console.log(`  gcloud run deploy ${service} \\`);
  console.log(`    --source ./orchestrator \\`);
  console.log(`    --region ${region} \\`);
  console.log(`    --memory ${memory} \\`);
  console.log(`    --cpu ${cpu} \\`);
  console.log(`    --platform managed`);

  console.log('\n✅ Cloud Run deployment instructions displayed');
}

async function deployVercel() {
  console.log('📦 Preparing Vercel deployment...');

  // Load vercel.json
  const vercelPath = path.join(process.cwd(), 'manifests', 'vercel.json');

  try {
    const content = await fs.readFile(vercelPath, 'utf-8');
    const config: VercelConfig = JSON.parse(content);
    console.log('Vercel config loaded:', config);
  } catch (error) {
    console.warn('⚠️  Could not load vercel.json');
  }

  console.log('\nNote: Actual deployment requires Vercel CLI');
  console.log('\nTo deploy manually, run:');
  console.log('  vercel --prod');

  console.log('\n✅ Vercel deployment instructions displayed');
}
