/**
 * ADE Fusion Stack UI
 * Web interface for the ADE platform
 */

import { createHealthCheck, getEnvVar, getEnvVarAsInt, type ServiceConfig, SDK_VERSION } from '@ade/shared-sdk';

const config: ServiceConfig = {
  serviceName: 'ade-ui',
  version: '1.0.0',
  port: getEnvVarAsInt('PORT', 3000),
  logLevel: (getEnvVar('LOG_LEVEL', 'info') as ServiceConfig['logLevel']),
};

export function getHealth() {
  return createHealthCheck(config);
}

export function getAppInfo() {
  return {
    name: 'ADE Fusion Stack UI',
    version: config.version,
    sdkVersion: SDK_VERSION,
  };
}

// Main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`Starting ${config.serviceName} on port ${config.port}`);
  console.log('Health:', getHealth());
  console.log('App Info:', getAppInfo());
}

export { config };
