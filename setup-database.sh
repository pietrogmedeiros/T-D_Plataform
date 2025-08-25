#!/bin/bash

# Script para configurar o banco Cloud SQL quando estiver pronto

PROJECT_ID="ted-webcontinental"
INSTANCE_NAME="td-platform-db"
DB_NAME="td_platform"
DB_PASSWORD="TdPlatform2025!"

echo "🔄 Aguardando instância Cloud SQL ficar pronta..."

# Aguardar até a instância estar RUNNABLE
while true; do
    STATUS=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(state)" 2>/dev/null)
    
    if [ "$STATUS" = "RUNNABLE" ]; then
        echo "✅ Instância Cloud SQL está pronta!"
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo "❌ Falha na criação da instância!"
        exit 1
    else
        echo "⏳ Status atual: $STATUS - aguardando..."
        sleep 30
    fi
done

echo "🔐 Configurando senha do usuário postgres..."
gcloud sql users set-password postgres \
    --instance=$INSTANCE_NAME \
    --password="$DB_PASSWORD" \
    --project=$PROJECT_ID

echo "📊 Criando banco de dados '$DB_NAME'..."
gcloud sql databases create $DB_NAME \
    --instance=$INSTANCE_NAME \
    --project=$PROJECT_ID \
    --charset=UTF8

echo "🔧 Configurando conexão autorizada..."
# Permitir conexões do App Engine
gcloud sql instances patch $INSTANCE_NAME \
    --authorized-gae-apps=$PROJECT_ID \
    --project=$PROJECT_ID

echo "✅ Configuração do banco concluída!"
echo "📋 Informações da conexão:"
echo "  Host: $(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format='value(ipAddresses[0].ipAddress)')"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  Username: postgres"
echo "  Password: $DB_PASSWORD"

echo ""
echo "🚀 Agora você pode fazer o deploy da aplicação!"
echo "Execute: gcloud app deploy --project=$PROJECT_ID"
