# Observability Documentation

## Overview

This directory contains documentation and configuration for the Auto-Dev-Engine observability stack.

## Intended Tooling

### Logging
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Log Aggregation**: Centralized logging with ELK Stack or Loki
- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL

### Metrics
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization dashboards
- **Key Metrics**:
  - Request latency (p50, p95, p99)
  - Error rates
  - Throughput (requests/sec)
  - Resource utilization (CPU, memory)
  - Queue depths
  - Token consumption rates

### Tracing
- **OpenTelemetry**: Distributed tracing standard
- **Jaeger/Zipkin**: Trace visualization
- **Trace Propagation**: W3C Trace Context headers

### Alerting
- **AlertManager**: Prometheus alerting
- **PagerDuty/Slack Integration**: Notification channels
- **Alert Tiers**: Critical, Warning, Info

## Configuration Files

| File | Description |
|------|-------------|
| `prometheus.yml` | Prometheus scrape configuration |
| `grafana/` | Grafana dashboards and datasources |
| `alerts/` | Alert rules and templates |
| `logging.json` | Logging configuration |

## Metrics Exposed

### Backend Service
- `ade_backend_requests_total` - Total HTTP requests
- `ade_backend_request_duration_seconds` - Request latency histogram
- `ade_backend_errors_total` - Total errors by type

### Policy Engine
- `ade_policy_evaluations_total` - Policy evaluations
- `ade_policy_denials_total` - Denied requests
- `ade_policy_latency_seconds` - Evaluation latency

### Quota Engine
- `ade_quota_tokens_available` - Available tokens by bucket
- `ade_quota_reservations_active` - Active reservations
- `ade_quota_depleted_total` - Quota exhaustion events

### Model Router
- `ade_router_requests_total` - Routing decisions
- `ade_router_endpoint_health` - Endpoint health status
- `ade_router_latency_seconds` - Routing decision latency

### Tool Bus
- `ade_toolbus_executions_total` - Tool executions
- `ade_toolbus_plugins_active` - Active plugins count
- `ade_toolbus_execution_duration_seconds` - Tool execution time

## Getting Started

1. Install observability stack dependencies
2. Configure Prometheus to scrape ADE services
3. Import Grafana dashboards
4. Set up alert rules

## Dashboard Examples

- **System Overview**: High-level health of all services
- **Request Flow**: End-to-end request tracing
- **Resource Usage**: CPU, memory, network metrics
- **SLO Tracking**: Service level objectives monitoring
