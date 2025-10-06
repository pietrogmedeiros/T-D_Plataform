#!/bin/bash

echo "🚀 DEPLOY COMPLETO NO AWS APP RUNNER"
echo "===================================="

# Configurações
REGION="us-east-2" 
APP_NAME="plataforma-ted-webcontinental"
SERVICE_NAME="$APP_NAME-service"
REPO_URL="https://github.com/pietrogmedeiros/T-D_Plataform.git"

echo "📋 Configurações:"
echo "  Região: $REGION"
echo "  App: $APP_NAME"
echo "  Service: $SERVICE_NAME"

# 1. Criar arquivo apprunner.yaml para configuração
echo ""
echo "📝 1. Criando configuração do App Runner..."
cat > apprunner.yaml << EOF
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - echo "🔨 Installing dependencies..."
      - npm ci
      - echo "🏗️ Building application..."
      - npm run build
run:
  runtime-version: 18
  command: npm start
  network:
    port: 3000
    env:
      - PORT=3000
      - NODE_ENV=production
      - AWS_REGION=us-east-2
      - S3_BUCKET_NAME=plataforma-ted-webcontinental-uploads
      - DYNAMODB_USERS_TABLE=plataforma-ted-webcontinental-users
      - DYNAMODB_TRAININGS_TABLE=plataforma-ted-webcontinental-trainings
      - DYNAMODB_USER_PROGRESS_TABLE=plataforma-ted-webcontinental-user-progress
      - DYNAMODB_TRAINING_RATINGS_TABLE=plataforma-ted-webcontinental-training-ratings
      - JWT_SECRET=td-platform-super-secret-jwt-key-2025
      - ADMIN_EMAIL=pietro.medeiros@webcontinental.com.br
EOF

# 2. Criar service role para App Runner
echo ""
echo "🔐 2. Criando IAM role para App Runner..."

# Verificar se role já existe
if aws iam get-role --role-name AppRunnerServiceRole 2>/dev/null; then
    echo "IAM Role AppRunnerServiceRole já existe"
else
    # Criar role
    cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    aws iam create-role \
        --role-name AppRunnerServiceRole \
        --assume-role-policy-document file://trust-policy.json

    # Anexar políticas necessárias
    aws iam attach-role-policy \
        --role-name AppRunnerServiceRole \
        --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

    aws iam attach-role-policy \
        --role-name AppRunnerServiceRole \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

    rm trust-policy.json
fi

# 3. Obter ARN da role
ROLE_ARN=$(aws iam get-role --role-name AppRunnerServiceRole --query 'Role.Arn' --output text)
echo "📋 Role ARN: $ROLE_ARN"

# 4. Criar serviço App Runner
echo ""
echo "🚀 3. Criando serviço App Runner..."

cat > apprunner-service.json << EOF
{
  "ServiceName": "$SERVICE_NAME",
  "SourceConfiguration": {
    "GitRepository": {
      "RepositoryUrl": "$REPO_URL",
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "main"
      },
      "CodeConfiguration": {
        "ConfigurationSource": "REPOSITORY"
      }
    },
    "AutoDeploymentsEnabled": true
  },
  "InstanceConfiguration": {
    "Cpu": "1024",
    "Memory": "2048",
    "InstanceRoleArn": "$ROLE_ARN"
  },
  "Tags": [
    {
      "Key": "awsApplication",
      "Value": "arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal"
    }
  ]
}
EOF

# Verificar se serviço já existe
if aws apprunner describe-service --service-arn "arn:aws:apprunner:$REGION:$(aws sts get-caller-identity --query Account --output text):service/$SERVICE_NAME" 2>/dev/null; then
    echo "⚠️ Serviço App Runner já existe. Atualizando..."
    aws apprunner update-service \
        --service-arn "arn:aws:apprunner:$REGION:$(aws sts get-caller-identity --query Account --output text):service/$SERVICE_NAME" \
        --source-configuration file://apprunner-service.json
else
    echo "🆕 Criando novo serviço App Runner..."
    SERVICE_RESPONSE=$(aws apprunner create-service \
        --cli-input-json file://apprunner-service.json \
        --region "$REGION")
    
    SERVICE_ARN=$(echo "$SERVICE_RESPONSE" | jq -r '.Service.ServiceArn')
    SERVICE_URL=$(echo "$SERVICE_RESPONSE" | jq -r '.Service.ServiceUrl')
    
    echo "✅ Serviço criado com sucesso!"
    echo "📋 Service ARN: $SERVICE_ARN"
    echo "🌐 Service URL: $SERVICE_URL"
fi

# 5. Cleanup
rm -f apprunner-service.json

echo ""
echo "✅ DEPLOY NO AWS APP RUNNER COMPLETO!"
echo "===================================="
echo ""
echo "🌐 Sua aplicação estará disponível em:"
echo "  https://$SERVICE_NAME.XXXXX.$REGION.awsapprunner.com"
echo ""
echo "📊 Recursos AWS utilizados:"
echo "  ✅ App Runner Service: $SERVICE_NAME"
echo "  ✅ S3 Bucket: plataforma-ted-webcontinental-uploads"
echo "  ✅ DynamoDB: plataforma-ted-webcontinental-users"
echo "  ✅ DynamoDB: plataforma-ted-webcontinental-trainings"
echo "  ✅ IAM Role: AppRunnerServiceRole"
echo ""
echo "🎯 Para verificar status:"
echo "  aws apprunner list-services --region $REGION"
echo ""
echo "🔄 O deploy levará alguns minutos para completar..."
echo "   Verifique o status no console AWS App Runner"