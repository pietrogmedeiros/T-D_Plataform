#!/bin/bash

set -e

echo "🚀 Iniciando deploy da Plataforma T&D na AWS..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    error "AWS CLI não está instalado. Por favor, instale primeiro:"
    echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Verificar se está autenticado na AWS
log "Verificando credenciais AWS..."
if ! aws sts get-caller-identity &> /dev/null; then
    error "Credenciais AWS não configuradas. Execute: aws configure"
    exit 1
fi

# Configurar variáveis
REGION="us-east-2"
APP_NAME="plataforma-ted-webcontinental"
S3_BUCKET="${APP_NAME}-uploads"
CLOUDFRONT_DISTRIBUTION_ID=""

# Aplicar tags da aplicação
APP_TAG_KEY="awsApplication"
APP_TAG_VALUE="arn:aws:resource-groups:us-east-2:075343201843:group/plataforma-ted-webcontinental/07pf4bafvqzmstnowmbe70haal"

log "Região: $REGION"
log "Aplicação: $APP_NAME"

# 1. Criar bucket S3 para uploads
log "Criando bucket S3: $S3_BUCKET"
if aws s3api head-bucket --bucket "$S3_BUCKET" --region "$REGION" 2>/dev/null; then
    warn "Bucket $S3_BUCKET já existe"
else
    aws s3api create-bucket \
        --bucket "$S3_BUCKET" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION"
    
    # Aplicar tags ao bucket
    aws s3api put-bucket-tagging \
        --bucket "$S3_BUCKET" \
        --tagging "TagSet=[{Key=$APP_TAG_KEY,Value=$APP_TAG_VALUE}]"
    
    log "✅ Bucket S3 criado com sucesso"
fi

# 2. Configurar CORS para o bucket S3
log "Configurando CORS para bucket S3..."
cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors \
    --bucket "$S3_BUCKET" \
    --cors-configuration file://cors-config.json

rm cors-config.json
log "✅ CORS configurado"

# 3. Criar tabelas DynamoDB
log "Criando tabelas DynamoDB..."

# Tabela de usuários
TABLE_USERS="${APP_NAME}-users"
log "Criando tabela: $TABLE_USERS"
if aws dynamodb describe-table --table-name "$TABLE_USERS" --region "$REGION" &>/dev/null; then
    warn "Tabela $TABLE_USERS já existe"
else
    aws dynamodb create-table \
        --table-name "$TABLE_USERS" \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
            AttributeName=email,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --global-secondary-indexes \
            IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
        --provisioned-throughput \
            ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --tags \
            Key="$APP_TAG_KEY",Value="$APP_TAG_VALUE" \
        --region "$REGION"
    
    log "✅ Tabela de usuários criada"
fi

# Tabela de treinamentos
TABLE_TRAININGS="${APP_NAME}-trainings"
log "Criando tabela: $TABLE_TRAININGS"
if aws dynamodb describe-table --table-name "$TABLE_TRAININGS" --region "$REGION" &>/dev/null; then
    warn "Tabela $TABLE_TRAININGS já existe"
else
    aws dynamodb create-table \
        --table-name "$TABLE_TRAININGS" \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
            AttributeName=uploaderId,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --global-secondary-indexes \
            IndexName=uploader-index,KeySchema=[{AttributeName=uploaderId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
        --provisioned-throughput \
            ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --tags \
            Key="$APP_TAG_KEY",Value="$APP_TAG_VALUE" \
        --region "$REGION"
    
    log "✅ Tabela de treinamentos criada"
fi

# Tabela de progresso do usuário
TABLE_PROGRESS="${APP_NAME}-user-progress"
log "Criando tabela: $TABLE_PROGRESS"
if aws dynamodb describe-table --table-name "$TABLE_PROGRESS" --region "$REGION" &>/dev/null; then
    warn "Tabela $TABLE_PROGRESS já existe"
else
    aws dynamodb create-table \
        --table-name "$TABLE_PROGRESS" \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
            AttributeName=userId,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --global-secondary-indexes \
            IndexName=user-index,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
        --provisioned-throughput \
            ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --tags \
            Key="$APP_TAG_KEY",Value="$APP_TAG_VALUE" \
        --region "$REGION"
    
    log "✅ Tabela de progresso criada"
fi

# Tabela de avaliações
TABLE_RATINGS="${APP_NAME}-training-ratings"
log "Criando tabela: $TABLE_RATINGS"
if aws dynamodb describe-table --table-name "$TABLE_RATINGS" --region "$REGION" &>/dev/null; then
    warn "Tabela $TABLE_RATINGS já existe"
else
    aws dynamodb create-table \
        --table-name "$TABLE_RATINGS" \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
            AttributeName=trainingId,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --global-secondary-indexes \
            IndexName=training-index,KeySchema=[{AttributeName=trainingId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
        --provisioned-throughput \
            ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --tags \
            Key="$APP_TAG_KEY",Value="$APP_TAG_VALUE" \
        --region "$REGION"
    
    log "✅ Tabela de avaliações criada"
fi

# 4. Aguardar tabelas ficarem ativas
log "Aguardando tabelas ficarem ativas..."
aws dynamodb wait table-exists --table-name "$TABLE_USERS" --region "$REGION"
aws dynamodb wait table-exists --table-name "$TABLE_TRAININGS" --region "$REGION"
aws dynamodb wait table-exists --table-name "$TABLE_PROGRESS" --region "$REGION"
aws dynamodb wait table-exists --table-name "$TABLE_RATINGS" --region "$REGION"
log "✅ Todas as tabelas estão ativas"

# 5. Criar role IAM para a aplicação
log "Criando role IAM..."
ROLE_NAME="${APP_NAME}-app-role"

# Política de confiança
cat > trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": [
                    "lambda.amazonaws.com",
                    "ecs-tasks.amazonaws.com"
                ]
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# Criar role se não existir
if aws iam get-role --role-name "$ROLE_NAME" &>/dev/null; then
    warn "Role $ROLE_NAME já existe"
else
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file://trust-policy.json \
        --tags \
            Key="$APP_TAG_KEY",Value="$APP_TAG_VALUE"
    
    log "✅ Role IAM criada"
fi

# Política de permissões para a aplicação
cat > app-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": [
                "arn:aws:dynamodb:$REGION:*:table/$TABLE_USERS",
                "arn:aws:dynamodb:$REGION:*:table/$TABLE_USERS/index/*",
                "arn:aws:dynamodb:$REGION:*:table/$TABLE_TRAININGS",
                "arn:aws:dynamodb:$REGION:*:table/$TABLE_TRAININGS/index/*",
                "arn:aws:dynamodb:$REGION:*:table/$TABLE_PROGRESS",
                "arn:aws:dynamodb:$REGION:*:table/$TABLE_PROGRESS/index/*",
                "arn:aws:dynamodb:$REGION:*:table/$TABLE_RATINGS",
                "arn:aws:dynamodb:$REGION:*:table/$TABLE_RATINGS/index/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectAcl",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::$S3_BUCKET",
                "arn:aws:s3:::$S3_BUCKET/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
EOF

# Anexar política ao role
POLICY_NAME="${APP_NAME}-policy"
aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "$POLICY_NAME" \
    --policy-document file://app-policy.json

# Limpeza
rm trust-policy.json app-policy.json

# 6. Construir aplicação
log "Construindo aplicação..."
npm install
npm run build

# 7. Criar arquivo de configuração para deploy
log "Criando configuração de deploy..."
cat > deploy-config.json << EOF
{
    "region": "$REGION",
    "appName": "$APP_NAME",
    "s3Bucket": "$S3_BUCKET",
    "dynamodbTables": {
        "users": "$TABLE_USERS",
        "trainings": "$TABLE_TRAININGS",
        "userProgress": "$TABLE_PROGRESS",
        "trainingRatings": "$TABLE_RATINGS"
    },
    "iamRole": "$ROLE_NAME",
    "tags": {
        "$APP_TAG_KEY": "$APP_TAG_VALUE"
    }
}
EOF

log "✅ Infraestrutura AWS criada com sucesso!"
echo ""
log "🔧 Próximos passos:"
echo "1. Configure suas credenciais AWS no arquivo .env.aws"
echo "2. AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY"
echo "3. Faça deploy usando Vercel, Netlify ou AWS Amplify"
echo ""
log "📋 Recursos criados:"
echo "- Bucket S3: $S3_BUCKET"
echo "- Tabelas DynamoDB: $TABLE_USERS, $TABLE_TRAININGS, $TABLE_PROGRESS, $TABLE_RATINGS"
echo "- Role IAM: $ROLE_NAME"
echo ""
log "🌟 Deploy concluído com sucesso!"