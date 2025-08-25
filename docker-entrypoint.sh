#!/bin/sh

# Script de inicialização do container

echo "🚀 Iniciando T&D Platform..."

# Aguardar banco de dados estar disponível
echo "⏳ Aguardando banco de dados..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ Banco de dados conectado!"

# Executar migrações
echo "🔄 Executando migrações do banco..."
npx prisma migrate deploy

# Executar seed de produção
echo "🌱 Populando banco com dados iniciais..."
node scripts/seed-production.js

# Iniciar aplicação
echo "🎯 Iniciando aplicação..."
exec node server.js
