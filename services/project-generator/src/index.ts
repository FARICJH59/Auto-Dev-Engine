/**
 * ADE Project Generator Service
 * Generates new project scaffolding based on templates
 */

import { createHealthCheck, getEnvVar, getEnvVarAsInt, type ServiceConfig } from '@ade/shared-sdk';

const config: ServiceConfig = {
  serviceName: 'project-generator',
  version: '1.0.0',
  port: getEnvVarAsInt('PORT', 8080),
  logLevel: (getEnvVar('LOG_LEVEL', 'info') as ServiceConfig['logLevel']),
};

export function getHealth() {
  return createHealthCheck(config);
}

export function generateProject(templateName: string, projectName: string): { success: boolean; path: string } {
  console.log(`Generating project ${projectName} from template ${templateName}`);
  return {
    success: true,
    path: `/projects/${projectName}`,
  };
}

// Main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`Starting ${config.serviceName} on port ${config.port}`);
  console.log('Health:', getHealth());
}

export { config };
