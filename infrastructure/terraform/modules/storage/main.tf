# Storage Module - AWS S3

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "cloud" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "cors_allowed_origins" {
  description = "Allowed origins for CORS. Use specific origins in production."
  type        = list(string)
  default     = []
}

# S3 Bucket
resource "aws_s3_bucket" "main" {
  count  = var.cloud == "aws" ? 1 : 0
  bucket = "${var.bucket_name}-${var.environment}"

  tags = {
    Name = "${var.project_name}-${var.environment}-storage"
  }
}

resource "aws_s3_bucket_versioning" "main" {
  count  = var.cloud == "aws" ? 1 : 0
  bucket = aws_s3_bucket.main[0].id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  count  = var.cloud == "aws" ? 1 : 0
  bucket = aws_s3_bucket.main[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  count  = var.cloud == "aws" ? 1 : 0
  bucket = aws_s3_bucket.main[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  count  = var.cloud == "aws" ? 1 : 0
  bucket = aws_s3_bucket.main[0].id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  rule {
    id     = "abort-incomplete-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "main" {
  count  = var.cloud == "aws" && length(var.cors_allowed_origins) > 0 ? 1 : 0
  bucket = aws_s3_bucket.main[0].id

  cors_rule {
    allowed_headers = ["Content-Type", "Authorization", "x-amz-date", "x-amz-content-sha256"]
    allowed_methods = ["GET", "HEAD", "PUT"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

output "bucket_name" {
  value = var.cloud == "aws" ? aws_s3_bucket.main[0].id : null
}

output "bucket_arn" {
  value = var.cloud == "aws" ? aws_s3_bucket.main[0].arn : null
}

output "bucket_domain_name" {
  value = var.cloud == "aws" ? aws_s3_bucket.main[0].bucket_domain_name : null
}
