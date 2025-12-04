# GCP Infrastructure Module - Main Configuration
# Provisions Cloud Functions, Cloud SQL PostgreSQL, Memorystore Redis, and GCS

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "storage.googleapis.com",
    "vpcaccess.googleapis.com",
    "secretmanager.googleapis.com"
  ])

  service            = each.value
  disable_on_destroy = false
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = "${var.project_name}-${var.environment}-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.required_apis]
}

resource "google_compute_subnetwork" "main" {
  name          = "${var.project_name}-${var.environment}-subnet"
  ip_cidr_range = var.subnet_cidr
  region        = var.gcp_region
  network       = google_compute_network.main.id

  private_ip_google_access = true
}

# VPC Connector for Cloud Functions
resource "google_vpc_access_connector" "connector" {
  name          = "${var.project_name}-${var.environment}-vpc-connector"
  region        = var.gcp_region
  ip_cidr_range = var.connector_cidr
  network       = google_compute_network.main.name
  machine_type  = "e2-micro"
  min_instances = 2
  max_instances = 3

  depends_on = [google_project_service.required_apis]
}

# Cloud SQL PostgreSQL
resource "google_sql_database_instance" "main" {
  name             = "${var.project_name}-${var.environment}-db"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier              = var.db_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_size         = var.db_disk_size
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
      require_ssl     = true

      ssl_mode = "ENCRYPTED_ONLY"
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "production"
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 7
      }
    }

    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }

    database_flags {
      name  = "log_connections"
      value = "on"
    }

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }
  }

  deletion_protection = var.environment == "production"

  depends_on = [google_project_service.required_apis]
}

resource "google_sql_database" "main" {
  name     = var.db_name
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "main" {
  name     = var.db_username
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Memorystore Redis
resource "google_redis_instance" "main" {
  name           = "${var.project_name}-${var.environment}-redis"
  tier           = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  memory_size_gb = var.redis_memory_size
  region         = var.gcp_region

  authorized_network = google_compute_network.main.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"

  redis_version = "REDIS_7_0"
  display_name  = "${var.project_name} ${var.environment} Redis"

  transit_encryption_mode = "SERVER_AUTHENTICATION"
  auth_enabled            = true

  depends_on = [google_project_service.required_apis]
}

# Cloud Storage Bucket
resource "google_storage_bucket" "main" {
  name          = "${var.project_name}-${var.environment}-${var.gcp_project_id}"
  location      = var.gcp_region
  force_destroy = var.environment != "production"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 5
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = var.cors_allowed_origins
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["Content-Type", "Authorization"]
    max_age_seconds = 3600
  }
}

# Secret Manager for sensitive data
resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.project_name}-${var.environment}-db-password"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# Service Account for Cloud Functions
resource "google_service_account" "cloud_function" {
  account_id   = "${var.project_name}-${var.environment}-cf"
  display_name = "Cloud Function Service Account"
}

resource "google_project_iam_member" "cloud_function_invoker" {
  project = var.gcp_project_id
  role    = "roles/cloudfunctions.invoker"
  member  = "serviceAccount:${google_service_account.cloud_function.email}"
}

resource "google_project_iam_member" "cloud_sql_client" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_function.email}"
}

resource "google_project_iam_member" "storage_object_user" {
  project = var.gcp_project_id
  role    = "roles/storage.objectUser"
  member  = "serviceAccount:${google_service_account.cloud_function.email}"
}

resource "google_project_iam_member" "secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_function.email}"
}

# Cloud Function (Gen 2)
resource "google_cloudfunctions2_function" "backend" {
  name     = "${var.project_name}-${var.environment}-backend"
  location = var.gcp_region

  build_config {
    runtime     = "nodejs20"
    entry_point = "handler"

    source {
      storage_source {
        bucket = google_storage_bucket.main.name
        object = google_storage_bucket_object.function_source.name
      }
    }
  }

  service_config {
    max_instance_count    = var.function_max_instances
    min_instance_count    = var.function_min_instances
    available_memory      = "${var.function_memory}Mi"
    timeout_seconds       = var.function_timeout
    service_account_email = google_service_account.cloud_function.email

    vpc_connector                 = google_vpc_access_connector.connector.id
    vpc_connector_egress_settings = "PRIVATE_RANGES_ONLY"

    environment_variables = {
      NODE_ENV       = var.environment
      DB_HOST        = google_sql_database_instance.main.private_ip_address
      DB_NAME        = var.db_name
      DB_USER        = var.db_username
      REDIS_HOST     = google_redis_instance.main.host
      REDIS_PORT     = google_redis_instance.main.port
      STORAGE_BUCKET = google_storage_bucket.main.name
      PROJECT_ID     = var.gcp_project_id
    }

    secret_environment_variables {
      key        = "DB_PASSWORD"
      project_id = var.gcp_project_id
      secret     = google_secret_manager_secret.db_password.secret_id
      version    = "latest"
    }
  }

  depends_on = [
    google_project_service.required_apis,
    google_secret_manager_secret_version.db_password
  ]
}

# Upload placeholder function source
resource "google_storage_bucket_object" "function_source" {
  name   = "function-source-${timestamp()}.zip"
  bucket = google_storage_bucket.main.name
  source = data.archive_file.function_placeholder.output_path
}

data "archive_file" "function_placeholder" {
  type        = "zip"
  output_path = "${path.module}/function_placeholder.zip"

  source {
    content  = <<-EOF
      const functions = require('@google-cloud/functions-framework');

      functions.http('handler', (req, res) => {
        res.json({ message: 'Backend API placeholder', environment: process.env.NODE_ENV });
      });
    EOF
    filename = "index.js"
  }

  source {
    content  = <<-EOF
      {
        "name": "backend-function",
        "version": "1.0.0",
        "dependencies": {
          "@google-cloud/functions-framework": "^3.0.0"
        }
      }
    EOF
    filename = "package.json"
  }
}

# Allow unauthenticated access (configure based on requirements)
resource "google_cloud_run_service_iam_member" "invoker" {
  location = google_cloudfunctions2_function.backend.location
  service  = google_cloudfunctions2_function.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
