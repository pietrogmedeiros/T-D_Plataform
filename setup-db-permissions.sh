#!/bin/bash
set -e

# Aguardar até que o PostgreSQL esteja pronto
echo "Aguardando PostgreSQL inicializar..."
until docker exec t-d-platform-postgres-1 pg_isready -U td_user -d td_platform 2>/dev/null; do
    sleep 1
done

echo "PostgreSQL está pronto. Configurando permissões..."

# Configurar permissões necessárias
docker exec t-d-platform-postgres-1 psql -U td_user -d td_platform -c "
-- Conceder todas as permissões no schema public
GRANT ALL PRIVILEGES ON SCHEMA public TO td_user;

-- Conceder permissões em todas as tabelas existentes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO td_user;

-- Conceder permissões em todas as sequências existentes  
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO td_user;

-- Configurar permissões padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO td_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO td_user;

-- Garantir que o usuário pode criar tabelas
GRANT CREATE ON SCHEMA public TO td_user;
"

echo "Permissões configuradas com sucesso!"