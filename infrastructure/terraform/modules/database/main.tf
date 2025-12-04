# Database Module - AWS RDS PostgreSQL

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "cloud" {
  type = string
}

variable "db_instance_type" {
  type    = string
  default = "db.t3.micro"
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

# Generate secure password
resource "random_password" "db_password" {
  count            = var.cloud == "aws" ? 1 : 0
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  count      = var.cloud == "aws" ? 1 : 0
  name       = "${var.project_name}-${var.environment}-db-subnet"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet"
  }
}

# Security Group
resource "aws_security_group" "db" {
  count       = var.cloud == "aws" ? 1 : 0
  name        = "${var.project_name}-${var.environment}-db-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "PostgreSQL access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-db-sg"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  count = var.cloud == "aws" ? 1 : 0

  identifier     = "${var.project_name}-${var.environment}-postgres"
  engine         = "postgres"
  engine_version = "15"
  instance_class = var.db_instance_type

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password[0].result

  db_subnet_group_name   = aws_db_subnet_group.main[0].name
  vpc_security_group_ids = [aws_security_group.db[0].id]

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  multi_az            = var.environment == "production"
  skip_final_snapshot = var.environment != "production"

  performance_insights_enabled = var.environment == "production"

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}

output "endpoint" {
  value     = var.cloud == "aws" ? aws_db_instance.main[0].endpoint : null
  sensitive = true
}

output "password" {
  value     = var.cloud == "aws" ? random_password.db_password[0].result : null
  sensitive = true
}
