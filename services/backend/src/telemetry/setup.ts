import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { logger } from '../utils/logger.js';

let sdk: NodeSDK | null = null;

export function setupTelemetry(): void {
  const otlpEndpoint = process.env.OTLP_ENDPOINT;
  
  if (!otlpEndpoint) {
    logger.info('OTLP_ENDPOINT not configured, telemetry disabled');
    return;
  }

  try {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'auto-dev-engine-backend',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      'cloud.provider': process.env.CLOUD_PROVIDER || 'unknown',
      'cloud.region': process.env.CLOUD_REGION || 'unknown'
    });

    const traceExporter = new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers: {
        'api-key': process.env.OTLP_API_KEY || ''
      }
    });

    const metricExporter = new OTLPMetricExporter({
      url: `${otlpEndpoint}/v1/metrics`,
      headers: {
        'api-key': process.env.OTLP_API_KEY || ''
      }
    });

    sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 60000
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false
          }
        })
      ]
    });

    sdk.start();
    logger.info({ endpoint: otlpEndpoint }, 'Telemetry initialized');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk?.shutdown()
        .then(() => logger.info('Telemetry shutdown complete'))
        .catch((err) => logger.error({ err }, 'Telemetry shutdown error'));
    });
  } catch (error) {
    logger.error({ error }, 'Failed to initialize telemetry');
  }
}
