/**
 * Backend Smoke Tests
 * Phase-2 - Basic functionality tests
 */

import { loadConfig, HelloWorldService, Config } from '../src/index';

describe('Backend Smoke Tests', () => {
  describe('loadConfig', () => {
    it('should load default configuration when no env vars set', () => {
      const config = loadConfig();
      
      expect(config.port).toBe(3000);
      expect(config.environment).toBe('development');
      expect(config.serviceName).toBe('ade-backend');
      expect(config.version).toBe('0.1.0');
    });

    it('should return valid config object structure', () => {
      const config = loadConfig();
      
      expect(typeof config.port).toBe('number');
      expect(typeof config.environment).toBe('string');
      expect(typeof config.serviceName).toBe('string');
      expect(typeof config.version).toBe('string');
    });
  });

  describe('HelloWorldService', () => {
    let service: HelloWorldService;
    let config: Config;

    beforeEach(() => {
      config = {
        port: 3000,
        environment: 'test',
        serviceName: 'test-backend',
        version: '1.0.0'
      };
      service = new HelloWorldService(config);
    });

    it('should greet with default name', () => {
      const greeting = service.greet();
      
      expect(greeting).toBe('Hello, World! Welcome to test-backend v1.0.0');
    });

    it('should greet with custom name', () => {
      const greeting = service.greet('Developer');
      
      expect(greeting).toBe('Hello, Developer! Welcome to test-backend v1.0.0');
    });

    it('should return health check status', () => {
      const health = service.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('test-backend');
      expect(typeof health.timestamp).toBe('string');
      expect(new Date(health.timestamp)).toBeInstanceOf(Date);
    });
  });
});
