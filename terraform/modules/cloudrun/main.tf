# Cloud Run Module
# Performance-optimized service deployment

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
}

variable "port" {
  description = "Container port"
  type        = number
}

variable "concurrency" {
  description = "Max concurrent requests per instance"
  type        = number
  default     = 80
}

variable "memory" {
  description = "Memory allocation"
  type        = string
  default     = "512Mi"
}

variable "cpu" {
  description = "CPU allocation"
  type        = string
  default     = "1"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 100
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "image" {
  description = "Container image"
  type        = string
  default     = null
}

# Local values
locals {
  # Use placeholder image if none provided
  container_image = var.image != null ? var.image : "gcr.io/cloudrun/hello"
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.region

  labels = var.labels

  template {
    labels = var.labels

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = local.container_image

      ports {
        container_port = var.port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }

        cpu_idle          = true  # CPU throttling - cost optimization
        startup_cpu_boost = true  # Faster cold starts
      }

      # Health check
      startup_probe {
        http_get {
          path = "/health"
          port = var.port
        }
        initial_delay_seconds = 5
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = var.port
        }
        initial_delay_seconds = 15
        timeout_seconds       = 5
        period_seconds        = 30
      }

      env {
        name  = "PORT"
        value = tostring(var.port)
      }

      env {
        name  = "NODE_ENV"
        value = var.environment == "prod" ? "production" : "development"
      }

      env {
        name  = "LOG_LEVEL"
        value = var.environment == "prod" ? "info" : "debug"
      }
    }

    max_instance_request_concurrency = var.concurrency

    # Service account (create if needed)
    # service_account = google_service_account.service_account.email

    # VPC connector for private networking (optional)
    # vpc_access {
    #   connector = google_vpc_access_connector.connector.id
    #   egress    = "PRIVATE_RANGES_ONLY"
    # }
  }

  # Traffic routing
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    ignore_changes = [
      # Ignore image changes managed by CI/CD
      template[0].containers[0].image,
    ]
  }
}

# IAM - Allow unauthenticated access (configure per requirements)
resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_v2_service.service.location
  service  = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Outputs
output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.service.uri
}

output "service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_v2_service.service.name
}
