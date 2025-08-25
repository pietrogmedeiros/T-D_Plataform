# Instruções para configurar PostgreSQL localmente

## Opção 1: Instalar PostgreSQL localmente

### macOS (usando Homebrew):
```bash
# Instalar PostgreSQL
brew install postgresql

# Iniciar serviço
brew services start postgresql

# Criar banco de dados
createdb td_platform

# Conectar ao banco
psql td_platform
```

### Configurar usuário e senha:
```sql
-- No psql, criar usuário e senha
CREATE USER td_user WITH PASSWORD 'td_password';
GRANT ALL PRIVILEGES ON DATABASE td_platform TO td_user;
```

### Atualizar .env.local:
```env
DATABASE_URL="postgresql://td_user:td_password@localhost:5432/td_platform?schema=public"
```

## Opção 2: Usar Docker (mais fácil)

### 1. Criar arquivo docker-compose.yml:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: td_user
      POSTGRES_PASSWORD: td_password
      POSTGRES_DB: td_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 2. Executar Docker:
```bash
# Subir container PostgreSQL
docker-compose up -d

# Verificar se está funcionando
docker-compose ps
```

### 3. Configurar variável de ambiente:
```env
DATABASE_URL="postgresql://td_user:td_password@localhost:5432/td_platform?schema=public"
```

## Executar migrações Prisma

Após configurar o PostgreSQL:

```bash
# Gerar e executar migração
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate

# Ver banco de dados (opcional)
npx prisma studio
```

## Testar conexão

```bash
# Verificar se a conexão está funcionando
npx prisma db pull
```

Se não aparecer erros, a conexão está funcionando!
