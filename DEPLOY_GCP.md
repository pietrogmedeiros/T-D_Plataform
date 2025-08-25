# Plataforma T&D Web - Deploy na Google Cloud Platform

Este documento detalha o processo de deploy da Plataforma de Treinamento e Desenvolvimento na Google Cloud Platform.

## 🏗️ Arquitetura da Solução

- **App Engine**: Hospedagem da aplicação Next.js
- **Cloud SQL**: Banco de dados PostgreSQL 14
- **Secret Manager**: Gerenciamento seguro de credenciais
- **Cloud Storage**: Armazenamento de arquivos de vídeo (opcional)

## 📋 Pré-requisitos

### 1. Google Cloud SDK
```bash
# macOS
brew install google-cloud-sdk

# Ou baixe direto: https://cloud.google.com/sdk/docs/install
```

### 2. Autenticação
```bash
gcloud auth login
gcloud auth application-default login
```

### 3. Configurações Iniciais
```bash
# Definir projeto padrão
gcloud config set project SEU_PROJECT_ID

# Habilitar APIs necessárias
gcloud services enable sqladmin.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## 🚀 Deploy Automático

Execute o script de deploy automatizado:

```bash
./deploy-gcp.sh
```

Este script irá:
1. ✅ Criar projeto no GCP (se não existir)
2. ✅ Habilitar APIs necessárias
3. ✅ Criar instância Cloud SQL PostgreSQL
4. ✅ Configurar banco de dados
5. ✅ Gerar senhas seguras
6. ✅ Configurar Secret Manager
7. ✅ Fazer build da aplicação
8. ✅ Deploy no App Engine
9. ✅ Executar migrações
10. ✅ Popular dados iniciais

## 🔧 Deploy Manual

### 1. Criar Instância Cloud SQL
```bash
gcloud sql instances create td-platform-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup \
    --enable-bin-log
```

### 2. Criar Banco de Dados
```bash
gcloud sql databases create td_platform --instance=td-platform-db
```

### 3. Configurar Usuário
```bash
gcloud sql users set-password postgres \
    --instance=td-platform-db \
    --password=SUA_SENHA_SEGURA
```

### 4. Configurar Secrets
```bash
# DATABASE_URL
echo -n "postgresql://postgres:SENHA@IP:5432/td_platform" | \
    gcloud secrets create database-url --data-file=-

# NEXTAUTH_URL
echo -n "https://SEU_PROJECT_ID.uc.r.appspot.com" | \
    gcloud secrets create nextauth-url --data-file=-

# NEXTAUTH_SECRET
echo -n "$(openssl rand -base64 32)" | \
    gcloud secrets create nextauth-secret --data-file=-
```

### 5. Deploy da Aplicação
```bash
# Build
npm run build

# Deploy
gcloud app deploy
```

### 6. Executar Migrações
```bash
DATABASE_URL="sua_connection_string" npx prisma migrate deploy
```

### 7. Popular Dados Iniciais
```bash
DATABASE_URL="sua_connection_string" node scripts/seed-production.js
```

## 📊 Dados Pré-configurados

### Usuários Criados
- **pietro.medeiros@webcontinental.com.br** (ADMIN)
  - Senha: `P@ula07021995`
- **admin@webcontinental.com.br** (ADMIN)
  - Senha: `123456`
- **usuario@webcontinental.com.br** (USER)
  - Senha: `123456`

### Treinamentos Criados
1. **Segurança do Trabalho - Fundamentos**
   - Objetivos: NRs, EPIs/EPCs, Prevenção, Emergência
2. **Liderança e Gestão de Equipes**
   - Objetivos: Liderança moderna, Comunicação, Conflitos, Motivação
3. **Compliance e Ética Empresarial**
   - Objetivos: Compliance, Ética, Anticorrupção, LGPD

## 🔍 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Login/logout seguro
- Controle de acesso por perfil (Admin/User)
- Senha personalizada para Pietro

### ✅ Gestão de Treinamentos
- Upload de vídeos com validação
- Formulário com objetivos de aprendizado (4 campos)
- Descrição com suporte a HTML
- Status de publicação

### ✅ Progresso Automático
- Detecção automática de 50% de conclusão
- Marcação automática de 100% ao fim do vídeo
- Persistência no banco PostgreSQL

### ✅ Sistema de Avaliação
- Avaliação por estrelas (1-5)
- Persistência individual por usuário/treinamento
- Interface intuitiva

### ✅ Dashboard Dinâmico
- Estatísticas reais do progresso
- Cálculo automático de percentuais
- Dados atualizados em tempo real

### ✅ Área Administrativa
- Upload de novos treinamentos
- Gestão de usuários
- Dashboard administrativo

## 🔒 Segurança

### Headers de Segurança
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`

### Proteção de Dados
- Senhas não armazenadas (validação por API)
- Conexão SSL obrigatória
- Secrets gerenciados pelo Secret Manager

### Controle de Acesso
- Middleware de proteção de rotas
- Validação de perfis de usuário
- Sessions seguras

## 🏃‍♂️ Comandos Úteis

### Verificar Status
```bash
# Status da aplicação
gcloud app describe

# Logs da aplicação
gcloud app logs tail -s default

# Status do banco
gcloud sql instances describe td-platform-db
```

### Manutenção
```bash
# Conectar ao banco
gcloud sql connect td-platform-db --user=postgres

# Backup do banco
gcloud sql export sql td-platform-db gs://SEU_BUCKET/backup-$(date +%Y%m%d).sql \
    --database=td_platform

# Escalar aplicação
gcloud app versions list
gcloud app services set-traffic default --splits=VERSION=100
```

### Debugging
```bash
# Logs em tempo real
gcloud app logs tail -s default

# Métricas
gcloud app operations list

# Conectar via SSH (se disponível)
gcloud app instances ssh INSTANCE_ID
```

## 📈 Monitoramento

### Logs Estruturados
- Todas as operações são logadas
- Formato estruturado para análise
- Rastreamento de performance

### Métricas Importantes
- Tempo de resposta das APIs
- Taxa de erro das operações
- Uso de recursos (CPU/Memória)
- Conexões de banco de dados

## 🔄 CI/CD (Futuro)

Para implementar CI/CD automático:

1. **GitHub Actions**
2. **Cloud Build**
3. **Deploy automatizado por branch**
4. **Testes automatizados**

## 💰 Custos Estimados

### Configuração Mínima (Free Tier)
- App Engine: ~$0-25/mês
- Cloud SQL (db-f1-micro): ~$7-15/mês
- Storage: ~$0-5/mês

**Total estimado: $7-45/mês**

### Configuração Recomendada
- App Engine: ~$25-50/mês
- Cloud SQL (db-n1-standard-1): ~$25-50/mês
- Storage: ~$5-15/mês

**Total estimado: $55-115/mês**

## 🆘 Suporte

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar firewall rules
   - Validar connection string
   - Checar status da instância

2. **Deploy falha**
   - Verificar logs do Cloud Build
   - Validar app.yaml
   - Checar quotas do projeto

3. **Aplicação não carrega**
   - Verificar logs do App Engine
   - Validar variáveis de ambiente
   - Checar build da aplicação

### Contatos
- **Desenvolvedor**: Pietro Medeiros
- **Email**: pietro.medeiros@webcontinental.com.br

## 📋 Checklist de Deploy

- [ ] Google Cloud SDK instalado
- [ ] Projeto GCP criado
- [ ] APIs habilitadas
- [ ] Cloud SQL configurado
- [ ] Secrets configurados
- [ ] Build realizado com sucesso
- [ ] Deploy no App Engine concluído
- [ ] Migrações executadas
- [ ] Dados iniciais inseridos
- [ ] Teste de login realizado
- [ ] Funcionalidades validadas
- [ ] Monitoramento configurado

---

🎉 **Pronto! Sua Plataforma T&D está no ar na Google Cloud Platform!**
