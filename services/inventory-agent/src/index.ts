/**
 * ADE Inventory Agent Service
 * Manages inventory and resource tracking
 */

import { createHealthCheck, getEnvVar, getEnvVarAsInt, type ServiceConfig } from '@ade/shared-sdk';

const config: ServiceConfig = {
  serviceName: 'inventory-agent',
  version: '1.0.0',
  port: getEnvVarAsInt('PORT', 8082),
  logLevel: (getEnvVar('LOG_LEVEL', 'info') as ServiceConfig['logLevel']),
};

export function getHealth() {
  return createHealthCheck(config);
}

export function getInventory(): { items: string[] } {
  console.log('Fetching inventory');
  return {
    items: ['item1', 'item2', 'item3'],
  };
}

// Main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`Starting ${config.serviceName} on port ${config.port}`);
  console.log('Health:', getHealth());
}

export { config };
