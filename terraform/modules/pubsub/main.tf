# Pub/Sub Module
# Message queuing for service communication

variable "project_id" {
  description = "GCP Project ID"
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

# Local values
locals {
  topics = {
    project-events     = "ade-project-events-${var.environment}"
    vision-tasks       = "ade-vision-tasks-${var.environment}"
    inventory-updates  = "ade-inventory-updates-${var.environment}"
    orchestrator-jobs  = "ade-orchestrator-jobs-${var.environment}"
  }
}

# Pub/Sub Topics (parallel creation)
resource "google_pubsub_topic" "topics" {
  for_each = local.topics

  name   = each.value
  labels = var.labels

  message_retention_duration = "604800s" # 7 days
}

# Dead letter topic for failed messages
resource "google_pubsub_topic" "dead_letter" {
  name   = "ade-dead-letter-${var.environment}"
  labels = var.labels

  message_retention_duration = "2592000s" # 30 days
}

# Subscriptions for each topic
resource "google_pubsub_subscription" "subscriptions" {
  for_each = local.topics

  name  = "${each.value}-sub"
  topic = google_pubsub_topic.topics[each.key].id

  labels = var.labels

  # Acknowledgment deadline
  ack_deadline_seconds = 30

  # Message retention
  message_retention_duration = "604800s" # 7 days

  # Retain acknowledged messages
  retain_acked_messages = true

  # Expiration policy
  expiration_policy {
    ttl = "" # Never expire
  }

  # Dead letter policy
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = 5
  }

  # Retry policy
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}

# Outputs
output "topic_names" {
  description = "Pub/Sub topic names"
  value = {
    for k, v in google_pubsub_topic.topics : k => v.name
  }
}

output "topic_ids" {
  description = "Pub/Sub topic IDs"
  value = {
    for k, v in google_pubsub_topic.topics : k => v.id
  }
}

output "subscription_names" {
  description = "Pub/Sub subscription names"
  value = {
    for k, v in google_pubsub_subscription.subscriptions : k => v.name
  }
}
