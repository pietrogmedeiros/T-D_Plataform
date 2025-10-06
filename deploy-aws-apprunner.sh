#!/bin/bash

echo "🚀 Deploying Plataforma T&D para AWS App Runner..."

# Configurações
REGION="us-east-2"
APP_NAME="plataforma-ted-webcontinental"
SERVICE_NAME="$APP_NAME-apprunner"
ECR_REPO="$APP_NAME-ecr"

echo "📋 Configurações:"
echo "  Região: $REGION"
echo "  App: $APP_NAME"
echo "  Service: $SERVICE_NAME"

# 1. Criar repositório ECR
echo "🐳 Criando repositório ECR..."
aws ecr create-repository \
    --repository-name "$ECR_REPO" \
    --region "$REGION" \
    --tags Key=awsApplication,Value=arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal \
    2>/dev/null || echo "✅ Repositório ECR já existe"

# 2. Obter URL do ECR
ECR_URL=$(aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$REGION" --query 'repositories[0].repositoryUri' --output text)
echo "📦 ECR URL: $ECR_URL"

# 3. Login no ECR
echo "🔐 Fazendo login no ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_URL"

# 4. Build da imagem Docker
echo "🔨 Building imagem Docker..."
docker build -f Dockerfile.aws -t "$ECR_REPO" .

# 5. Tag e push para ECR
echo "📤 Enviando para ECR..."
docker tag "$ECR_REPO:latest" "$ECR_URL:latest"
docker push "$ECR_URL:latest"

# 6. Criar IAM Role para App Runner (se não existir)
echo "🔑 Verificando IAM Role..."
aws iam get-role --role-name AppRunnerECRAccessRole 2>/dev/null || {
    echo "🔑 Criando IAM Role para App Runner..."
    
    # Trust policy
    cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    aws iam create-role \
        --role-name AppRunnerECRAccessRole \
        --assume-role-policy-document file://trust-policy.json

    aws iam attach-role-policy \
        --role-name AppRunnerECRAccessRole \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess

    rm trust-policy.json
}

# 7. Obter ARN da role
ROLE_ARN=$(aws iam get-role --role-name AppRunnerECRAccessRole --query 'Role.Arn' --output text)
echo "🔑 Role ARN: $ROLE_ARN"

# 8. Criar configuração do App Runner
cat > apprunner-config.json << EOF
{
  "ServiceName": "$SERVICE_NAME",
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "$ECR_URL:latest",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "AWS_REGION": "$REGION",
          "S3_BUCKET_NAME": "plataforma-ted-webcontinental-uploads",
          "DYNAMODB_USERS_TABLE": "plataforma-ted-webcontinental-users",
          "DYNAMODB_TRAININGS_TABLE": "plataforma-ted-webcontinental-trainings",
          "DYNAMODB_USER_PROGRESS_TABLE": "plataforma-ted-webcontinental-user-progress",
          "DYNAMODB_TRAINING_RATINGS_TABLE": "plataforma-ted-webcontinental-training-ratings",
          "JWT_SECRET": "td-platform-super-secret-jwt-key-2025",
          "ADMIN_EMAIL": "pietro.medeiros@webcontinental.com.br",
          "NODE_ENV": "production"
        }
      },
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": false,
    "AccessRoleArn": "$ROLE_ARN"
  },
  "InstanceConfiguration": {
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  },
  "Tags": [
    {
      "Key": "awsApplication",
      "Value": "arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal"
    }
  ]
}
EOF

# 9. Criar serviço App Runner
echo "🚀 Criando App Runner Service..."
aws apprunner create-service \
    --cli-input-json file://apprunner-config.json \
    --region "$REGION"

# 10. Aguardar o serviço ficar pronto
echo "⏳ Aguardando App Runner Service ficar ativo..."
aws apprunner wait service-running \
    --service-arn $(aws apprunner list-services --region "$REGION" --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" --output text) \
    --region "$REGION"

# 11. Obter URL do serviço
SERVICE_URL=$(aws apprunner describe-service \
    --service-arn $(aws apprunner list-services --region "$REGION" --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" --output text) \
    --region "$REGION" \
    --query 'Service.ServiceUrl' \
    --output text)

echo ""
echo "🎉 DEPLOY COMPLETO!"
echo "🌐 URL da Aplicação: https://$SERVICE_URL"
echo "📊 Console AWS: https://console.aws.amazon.com/apprunner/home?region=$REGION"
echo ""
echo "✅ Login: pietro.medeiros@webcontinental.com.br"
echo "✅ Senha: P@ula07021995"
echo ""
echo "🗑️  Para remover: aws apprunner delete-service --service-arn [ARN] --region $REGION"

# Cleanup
rm -f apprunner-config.json

echo "✅ Deploy AWS App Runner concluído!"