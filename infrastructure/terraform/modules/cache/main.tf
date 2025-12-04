# Cache Module - AWS ElastiCache Redis

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "cloud" {
  type = string
}

variable "cache_node_type" {
  type    = string
  default = "cache.t3.micro"
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  count      = var.cloud == "aws" ? 1 : 0
  name       = "${var.project_name}-${var.environment}-cache-subnet"
  subnet_ids = var.subnet_ids
}

# Security Group
resource "aws_security_group" "cache" {
  count       = var.cloud == "aws" ? 1 : 0
  name        = "${var.project_name}-${var.environment}-cache-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Redis access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cache-sg"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "main" {
  count = var.cloud == "aws" ? 1 : 0

  replication_group_id = "${var.project_name}-${var.environment}-redis"
  description          = "Redis cluster for ${var.project_name}"

  node_type            = var.cache_node_type
  num_cache_clusters   = var.environment == "production" ? 2 : 1
  port                 = 6379
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"

  subnet_group_name  = aws_elasticache_subnet_group.main[0].name
  security_group_ids = [aws_security_group.cache[0].id]

  automatic_failover_enabled = var.environment == "production"
  multi_az_enabled           = var.environment == "production"

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  snapshot_retention_limit = var.environment == "production" ? 7 : 0
  snapshot_window          = "05:00-06:00"

  tags = {
    Name = "${var.project_name}-${var.environment}-redis"
  }
}

output "endpoint" {
  value     = var.cloud == "aws" ? aws_elasticache_replication_group.main[0].primary_endpoint_address : null
  sensitive = true
}

output "port" {
  value = var.cloud == "aws" ? 6379 : null
}
