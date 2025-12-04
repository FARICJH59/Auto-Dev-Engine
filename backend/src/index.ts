/**
 * Auto-Dev-Engine Backend Service
 * Phase-2 Hello World Stub
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load configuration from environment
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface Config {
  port: number;
  environment: string;
  serviceName: string;
  version: string;
}

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): Config {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    serviceName: process.env.SERVICE_NAME || 'ade-backend',
    version: process.env.VERSION || '0.1.0'
  };
}

/**
 * Hello World service stub
 */
export class HelloWorldService {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Returns a greeting message
   */
  greet(name: string = 'World'): string {
    return `Hello, ${name}! Welcome to ${this.config.serviceName} v${this.config.version}`;
  }

  /**
   * Health check endpoint
   */
  healthCheck(): { status: string; timestamp: string; service: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: this.config.serviceName
    };
  }
}

// Main entry point
async function main(): Promise<void> {
  const config = loadConfig();
  const service = new HelloWorldService(config);

  console.log(`Starting ${config.serviceName} in ${config.environment} mode...`);
  console.log(service.greet());
  console.log('Health:', JSON.stringify(service.healthCheck(), null, 2));
  console.log(`Server would start on port ${config.port}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
