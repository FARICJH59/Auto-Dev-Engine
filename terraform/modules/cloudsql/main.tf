# Cloud SQL Module
# PostgreSQL database for relational data

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

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "enable" {
  description = "Enable Cloud SQL module"
  type        = bool
  default     = false
}

variable "db_password" {
  description = "Database user password. Must be provided - do not use defaults. In production, use Secret Manager."
  type        = string
  sensitive   = true
  default     = null # No default - must be explicitly provided when enable=true

  validation {
    condition     = !var.enable || (var.enable && var.db_password != null && length(var.db_password) >= 16)
    error_message = "When Cloud SQL is enabled, db_password must be provided and at least 16 characters long."
  }
}

variable "authorized_networks" {
  description = "List of authorized networks for Cloud SQL access. Only used for non-production environments."
  type = list(object({
    name = string
    cidr = string
  }))
  default = []

  validation {
    condition     = alltrue([for net in var.authorized_networks : can(cidrhost(net.cidr, 0))])
    error_message = "All authorized_networks entries must have valid CIDR notation."
  }
}

# Local values
locals {
  instance_name = "ade-postgres-${var.environment}"
  database_name = "ade_${var.environment}"
}

# Cloud SQL PostgreSQL instance (conditional)
resource "google_sql_database_instance" "instance" {
  count = var.enable ? 1 : 0

  name             = local.instance_name
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = var.tier

    # Availability type
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"

    # Backup configuration
    backup_configuration {
      enabled                        = var.environment == "prod"
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "prod"
      transaction_log_retention_days = var.environment == "prod" ? 7 : 1

      backup_retention_settings {
        retained_backups = var.environment == "prod" ? 30 : 7
      }
    }

    # IP configuration
    ip_configuration {
      ipv4_enabled    = var.environment != "prod"
      private_network = null # Configure VPC for production

      # Authorized networks - MUST be restricted in production
      # This is only enabled for non-production environments
      dynamic "authorized_networks" {
        for_each = var.environment != "prod" && length(var.authorized_networks) > 0 ? var.authorized_networks : []
        content {
          name  = authorized_networks.value.name
          value = authorized_networks.value.cidr
        }
      }
    }

    # Maintenance window
    maintenance_window {
      day          = 7 # Sunday
      hour         = 4
      update_track = "stable"
    }

    # Database flags for performance
    database_flags {
      name  = "max_connections"
      value = var.environment == "prod" ? "200" : "100"
    }

    user_labels = var.labels
  }

  deletion_protection = var.environment == "prod"
}

# Database
resource "google_sql_database" "database" {
  count = var.enable ? 1 : 0

  name     = local.database_name
  instance = google_sql_database_instance.instance[0].name
}

# Database user - password should be provided via variable or Secret Manager
resource "google_sql_user" "users" {
  count = var.enable ? 1 : 0

  name     = "ade_app"
  instance = google_sql_database_instance.instance[0].name
  
  # Password must be provided via variable; do not use default
  # In production, integrate with Secret Manager for rotation
  password = var.db_password
}

# Outputs
output "instance_name" {
  description = "Cloud SQL instance name"
  value       = var.enable ? google_sql_database_instance.instance[0].name : null
}

output "connection_name" {
  description = "Cloud SQL connection name"
  value       = var.enable ? google_sql_database_instance.instance[0].connection_name : null
}

output "database_name" {
  description = "Database name"
  value       = var.enable ? google_sql_database.database[0].name : null
}

output "public_ip" {
  description = "Cloud SQL public IP"
  value       = var.enable ? google_sql_database_instance.instance[0].public_ip_address : null
}
