# GCP Outputs

output "function_url" {
  description = "Cloud Function URL"
  value       = google_cloudfunctions2_function.backend.url
}

output "function_name" {
  description = "Cloud Function name"
  value       = google_cloudfunctions2_function.backend.name
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.main.connection_name
  sensitive   = true
}

output "database_private_ip" {
  description = "Cloud SQL private IP"
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
}

output "redis_host" {
  description = "Memorystore Redis host"
  value       = google_redis_instance.main.host
  sensitive   = true
}

output "redis_port" {
  description = "Memorystore Redis port"
  value       = google_redis_instance.main.port
}

output "storage_bucket" {
  description = "GCS bucket name"
  value       = google_storage_bucket.main.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = google_compute_network.main.id
}

output "service_account_email" {
  description = "Cloud Function service account email"
  value       = google_service_account.cloud_function.email
}
