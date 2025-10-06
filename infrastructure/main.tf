# Configuração do provider AWS
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      awsApplication = var.aws_application_tag
      Environment    = var.environment
      Project        = var.project_name
    }
  }
}

# Variáveis
variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-2"
}

variable "aws_application_tag" {
  description = "Tag da aplicação AWS"
  type        = string
  default     = "arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal"
}

variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "plataforma-ted-webcontinental"
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
  default     = "prod"
}

# Bucket S3 para uploads
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-uploads"
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Tabela DynamoDB - Usuários
resource "aws_dynamodb_table" "users" {
  name           = "${var.project_name}-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }
}

# Tabela DynamoDB - Treinamentos
resource "aws_dynamodb_table" "trainings" {
  name           = "${var.project_name}-trainings"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "uploaderId"
    type = "S"
  }

  global_secondary_index {
    name            = "uploader-index"
    hash_key        = "uploaderId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }
}

# Tabela DynamoDB - Progresso do Usuário
resource "aws_dynamodb_table" "user_progress" {
  name           = "${var.project_name}-user-progress"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "user-index"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }
}

# Tabela DynamoDB - Avaliações de Treinamento
resource "aws_dynamodb_table" "training_ratings" {
  name           = "${var.project_name}-training-ratings"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "trainingId"
    type = "S"
  }

  global_secondary_index {
    name            = "training-index"
    hash_key        = "trainingId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }
}

# IAM Role para a aplicação
resource "aws_iam_role" "app_role" {
  name = "${var.project_name}-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "ecs-tasks.amazonaws.com"
          ]
        }
      }
    ]
  })
}

# Política IAM para acesso ao DynamoDB
resource "aws_iam_role_policy" "app_dynamodb_policy" {
  name = "${var.project_name}-dynamodb-policy"
  role = aws_iam_role.app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          aws_dynamodb_table.trainings.arn,
          "${aws_dynamodb_table.trainings.arn}/index/*",
          aws_dynamodb_table.user_progress.arn,
          "${aws_dynamodb_table.user_progress.arn}/index/*",
          aws_dynamodb_table.training_ratings.arn,
          "${aws_dynamodb_table.training_ratings.arn}/index/*"
        ]
      }
    ]
  })
}

# Política IAM para acesso ao S3
resource "aws_iam_role_policy" "app_s3_policy" {
  name = "${var.project_name}-s3-policy"
  role = aws_iam_role.app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObjectAcl",
          "s3:PutObjectAcl"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })
}

# Outputs
output "s3_bucket_name" {
  description = "Nome do bucket S3"
  value       = aws_s3_bucket.uploads.id
}

output "dynamodb_tables" {
  description = "Nomes das tabelas DynamoDB"
  value = {
    users            = aws_dynamodb_table.users.name
    trainings        = aws_dynamodb_table.trainings.name
    user_progress    = aws_dynamodb_table.user_progress.name
    training_ratings = aws_dynamodb_table.training_ratings.name
  }
}

output "iam_role_arn" {
  description = "ARN do role IAM"
  value       = aws_iam_role.app_role.arn
}

output "s3_bucket_domain" {
  description = "Domínio do bucket S3"
  value       = aws_s3_bucket.uploads.bucket_domain_name
}