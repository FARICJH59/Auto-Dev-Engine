# Firestore Module
# Document database for application data

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

# Firestore database (Native mode)
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region

  type             = "FIRESTORE_NATIVE"
  concurrency_mode = "OPTIMISTIC"

  # Point-in-time recovery (optional, adds cost)
  point_in_time_recovery_enablement = var.environment == "prod" ? "POINT_IN_TIME_RECOVERY_ENABLED" : "POINT_IN_TIME_RECOVERY_DISABLED"

  # Delete protection for production
  delete_protection_state = var.environment == "prod" ? "DELETE_PROTECTION_ENABLED" : "DELETE_PROTECTION_DISABLED"
}

# Firestore indexes for common queries
resource "google_firestore_index" "projects_by_status" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "projects"

  fields {
    field_path = "status"
    order      = "ASCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }
}

resource "google_firestore_index" "tasks_by_owner" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "tasks"

  fields {
    field_path = "ownerId"
    order      = "ASCENDING"
  }

  fields {
    field_path = "updatedAt"
    order      = "DESCENDING"
  }
}

# Outputs
output "database_name" {
  description = "Firestore database name"
  value       = google_firestore_database.database.name
}

output "database_id" {
  description = "Firestore database ID"
  value       = google_firestore_database.database.id
}
