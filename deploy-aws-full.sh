#!/bin/bash

echo "🚀 Migrando Plataforma T&D para AWS Completa..."

# Configurações
REGION="us-east-2"
APP_NAME="plataforma-ted-webcontinental"
ECR_REPO="$APP_NAME-app"
ECS_CLUSTER="$APP_NAME-cluster"
ECS_SERVICE="$APP_NAME-service"
ALB_NAME="$APP_NAME-alb"

echo "📋 Configurações:"
echo "  Região: $REGION"
echo "  App: $APP_NAME"
echo "  ECR: $ECR_REPO"

# 1. Criar repositório ECR para a imagem Docker
echo "🐳 Criando repositório ECR..."
aws ecr create-repository \
    --repository-name "$ECR_REPO" \
    --region "$REGION" \
    --tags Key=awsApplication,Value=arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal \
    2>/dev/null || echo "Repositório ECR já existe"

# 2. Obter URL do ECR
ECR_URL=$(aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$REGION" --query 'repositories[0].repositoryUri' --output text)
echo "📦 ECR URL: $ECR_URL"

# 3. Fazer login no ECR
echo "🔐 Fazendo login no ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_URL"

# 4. Build da imagem Docker
echo "🔨 Building imagem Docker..."
docker build -t "$ECR_REPO" .

# 5. Tag e push para ECR
echo "📤 Enviando para ECR..."
docker tag "$ECR_REPO:latest" "$ECR_URL:latest"
docker push "$ECR_URL:latest"

# 6. Criar cluster ECS
echo "🎯 Criando cluster ECS..."
aws ecs create-cluster \
    --cluster-name "$ECS_CLUSTER" \
    --capacity-providers FARGATE \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
    --tags key=awsApplication,value=arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal \
    --region "$REGION" \
    2>/dev/null || echo "Cluster ECS já existe"

# 7. Criar definição de tarefa
echo "📋 Criando task definition..."
cat > task-definition.json << EOF
{
  "family": "$APP_NAME-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::075343201843:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::075343201843:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "$APP_NAME-container",
      "image": "$ECR_URL:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "AWS_REGION", "value": "$REGION"},
        {"name": "S3_BUCKET_NAME", "value": "plataforma-ted-webcontinental-uploads"},
        {"name": "DYNAMODB_USERS_TABLE", "value": "plataforma-ted-webcontinental-users"},
        {"name": "DYNAMODB_TRAININGS_TABLE", "value": "plataforma-ted-webcontinental-trainings"},
        {"name": "JWT_SECRET", "value": "td-platform-super-secret-jwt-key-2025"},
        {"name": "ADMIN_EMAIL", "value": "pietro.medeiros@webcontinental.com.br"},
        {"name": "NODE_ENV", "value": "production"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$APP_NAME",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

aws ecs register-task-definition \
    --cli-input-json file://task-definition.json \
    --region "$REGION"

echo "✅ Deploy AWS ECS iniciado!"
echo "🌐 A aplicação estará disponível em breve no AWS ALB"
echo "📊 Para acompanhar: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $REGION"