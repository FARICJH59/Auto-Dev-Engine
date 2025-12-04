# ADE Fusion Stack - Terraform Configuration
# Performance-tuned GCP infrastructure with workspaces

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # Backend configuration - use GCS for state storage
  # Uncomment and configure for production use
  # backend "gcs" {
  #   bucket = "your-terraform-state-bucket"
  #   prefix = "ade-fusion-stack"
  # }
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "your-gcp-project-id"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Local values
locals {
  services = {
    project-generator = {
      name        = "ade-project-generator"
      port        = 8080
      concurrency = 250
      memory      = "512Mi"
      cpu         = "1"
    }
    vision-agent = {
      name        = "ade-vision-agent"
      port        = 8081
      concurrency = 80
      memory      = "1Gi"
      cpu         = "2"
    }
    inventory-agent = {
      name        = "ade-inventory-agent"
      port        = 8082
      concurrency = 150
      memory      = "512Mi"
      cpu         = "1"
    }
    ui = {
      name        = "ade-ui"
      port        = 3000
      concurrency = 200
      memory      = "512Mi"
      cpu         = "1"
    }
    orchestrator = {
      name        = "ade-orchestrator"
      port        = 8000
      concurrency = 100
      memory      = "512Mi"
      cpu         = "1"
    }
  }

  common_labels = {
    project     = "ade-fusion-stack"
    environment = var.environment
    managed-by  = "terraform"
  }
}

# Enable required APIs (parallel creation)
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "pubsub.googleapis.com",
    "firestore.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

# Cloud Run services using module
module "cloudrun" {
  source   = "./modules/cloudrun"
  for_each = local.services

  depends_on = [google_project_service.apis]

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  service_name = each.value.name
  port         = each.value.port
  concurrency  = each.value.concurrency
  memory       = each.value.memory
  cpu          = each.value.cpu
  labels       = local.common_labels
}

# Pub/Sub topics using module
module "pubsub" {
  source = "./modules/pubsub"

  depends_on = [google_project_service.apis]

  project_id  = var.project_id
  environment = var.environment
  labels      = local.common_labels
}

# Firestore using module
module "firestore" {
  source = "./modules/firestore"

  depends_on = [google_project_service.apis]

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

# Cloud SQL using module (optional, for relational data)
module "cloudsql" {
  source = "./modules/cloudsql"

  depends_on = [google_project_service.apis]

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  labels      = local.common_labels
}

# Outputs
output "service_urls" {
  description = "Cloud Run service URLs"
  value = {
    for k, v in module.cloudrun : k => v.service_url
  }
}

output "pubsub_topics" {
  description = "Pub/Sub topic names"
  value       = module.pubsub.topic_names
}
