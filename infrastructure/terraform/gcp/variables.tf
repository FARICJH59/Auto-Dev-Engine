# GCP Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "auto-dev-engine"
}

variable "environment" {
  description = "Deployment environment (development, staging, production)"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region for deployment"
  type        = string
  default     = "us-central1"
}

variable "subnet_cidr" {
  description = "CIDR block for the subnet"
  type        = string
  default     = "10.0.0.0/24"
}

variable "connector_cidr" {
  description = "CIDR block for VPC connector"
  type        = string
  default     = "10.8.0.0/28"
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_disk_size" {
  description = "Database disk size in GB"
  type        = number
  default     = 10
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "autodevengine"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "redis_memory_size" {
  description = "Memorystore Redis memory size in GB"
  type        = number
  default     = 1
}

variable "function_memory" {
  description = "Cloud Function memory in MB"
  type        = number
  default     = 512
}

variable "function_timeout" {
  description = "Cloud Function timeout in seconds"
  type        = number
  default     = 60
}

variable "function_max_instances" {
  description = "Maximum Cloud Function instances"
  type        = number
  default     = 100
}

variable "function_min_instances" {
  description = "Minimum Cloud Function instances (for cold start prevention)"
  type        = number
  default     = 1
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access to Cloud Function (set to false for production)"
  type        = bool
  default     = false
}

variable "cors_allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}
