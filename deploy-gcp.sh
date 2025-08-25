#!/bin/bash

# Script de deploy para GCP
echo "🚀 Iniciando deploy para Google Cloud Platform..."

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK não está instalado. Instale primeiro: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar se está logado no gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Não está logado no Google Cloud. Execute: gcloud auth login"
    exit 1
fi

# Variáveis do projeto
PROJECT_ID="ted-webcontinental"
REGION="us-central1"
DB_INSTANCE_NAME="td-platform-db"
DB_NAME="td_platform"
DB_USER="postgres"

echo "📋 Configuração do projeto:"
echo "  Project ID: $PROJECT_ID"
echo "  Região: $REGION"
echo "  Instância DB: $DB_INSTANCE_NAME"
echo ""

# Criar projeto se não existir
echo "🏗️  Criando/configurando projeto..."
gcloud projects create $PROJECT_ID --name="T&D Platform" || echo "Projeto já existe"
gcloud config set project $PROJECT_ID

# Habilitar APIs necessárias
echo "🔧 Habilitando APIs necessárias..."
gcloud services enable sqladmin.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Criar instância do Cloud SQL
echo "🗄️  Criando instância Cloud SQL PostgreSQL..."
gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup \
    --enable-bin-log || echo "Instância já existe"

# Criar banco de dados
echo "📊 Criando banco de dados..."
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME || echo "Banco já existe"

# Gerar senha aleatória para o postgres
DB_PASSWORD=$(openssl rand -base64 32)
echo "🔐 Configurando senha do banco..."
gcloud sql users set-password $DB_USER --instance=$DB_INSTANCE_NAME --password=$DB_PASSWORD

# Obter IP da instância
DB_CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(connectionName)")
DB_IP=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(ipAddresses[0].ipAddress)")

# Criar URL de conexão
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_IP:5432/$DB_NAME"

echo "📝 Criando secrets no Secret Manager..."
echo -n "$DATABASE_URL" | gcloud secrets create database-url --data-file=-
echo -n "https://$PROJECT_ID.uc.r.appspot.com" | gcloud secrets create nextauth-url --data-file=-
echo -n "$(openssl rand -base64 32)" | gcloud secrets create nextauth-secret --data-file=-

# Atualizar app.yaml com as variáveis
echo "📄 Atualizando configuração do App Engine..."
cat > app.yaml << EOF
runtime: nodejs20

env_variables:
  NODE_ENV: production
  DATABASE_URL: "$DATABASE_URL"
  NEXTAUTH_URL: "https://$PROJECT_ID.uc.r.appspot.com"
  NEXTAUTH_SECRET: "$(gcloud secrets versions access latest --secret=nextauth-secret)"

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 2
  disk_size_gb: 10

handlers:
  - url: /.*
    script: auto
    secure: always
    redirect_http_response_code: 301
EOF

echo "🏗️  Executando build da aplicação..."
npm run build

echo "🚀 Fazendo deploy para App Engine..."
gcloud app deploy --quiet

echo "📊 Executando migrações do banco..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

echo "🌱 Populando banco com dados iniciais..."
DATABASE_URL="$DATABASE_URL" node scripts/seed-production.js

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "🌐 URL da aplicação: https://$PROJECT_ID.uc.r.appspot.com"
echo "🗄️  Instância do banco: $DB_CONNECTION_NAME"
echo ""
echo "📝 Credenciais salvas em:"
echo "  - DATABASE_URL: Secret Manager"
echo "  - NEXTAUTH_URL: Secret Manager"
echo "  - NEXTAUTH_SECRET: Secret Manager"
echo ""
echo "🔑 Para acessar a aplicação, use:"
echo "  Email: pietro.medeiros@webcontinental.com.br"
echo "  Senha: P@ula07021995"
