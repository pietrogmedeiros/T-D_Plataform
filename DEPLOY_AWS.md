# 🚀 Deploy da Plataforma T&D na AWS

Este guia detalha como fazer o deploy da Plataforma de Treinamento e Desenvolvimento na AWS usando DynamoDB e S3.

## 📋 Pré-requisitos

- Conta AWS ativa
- AWS CLI instalado e configurado
- Node.js 18+ instalado
- Terraform instalado (opcional, para IaC)

## 🏗️ Arquitetura AWS

### Serviços Utilizados:
- **DynamoDB**: Banco de dados NoSQL para usuários, treinamentos, progresso e avaliações
- **S3**: Armazenamento de arquivos de vídeo e uploads
- **IAM**: Gerenciamento de permissões e roles
- **Vercel**: Hospedagem da aplicação Next.js

### Recursos Criados:
- Bucket S3: `plataforma-ted-webcontinental-uploads`
- Tabelas DynamoDB:
  - `plataforma-ted-webcontinental-users`
  - `plataforma-ted-webcontinental-trainings`
  - `plataforma-ted-webcontinental-user-progress`
  - `plataforma-ted-webcontinental-training-ratings`

## 🚀 Deploy Automático

### 1. Configurar Credenciais AWS

```bash
# Configure suas credenciais AWS
aws configure
```

### 2. Executar Script de Deploy

```bash
# Dar permissão de execução
chmod +x deploy-aws.sh

# Executar deploy
./deploy-aws.sh
```

Este script irá:
- ✅ Verificar credenciais AWS
- ✅ Criar bucket S3 com CORS configurado
- ✅ Criar tabelas DynamoDB com índices
- ✅ Configurar roles e políticas IAM
- ✅ Aplicar tags da aplicação

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.aws` e configure suas credenciais:

```bash
cp .env.aws .env.production
```

Edite `.env.production` com suas credenciais:

```env
# AWS Configuration
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui

# DynamoDB Tables (criadas pelo script)
DYNAMODB_USERS_TABLE=plataforma-ted-webcontinental-users
DYNAMODB_TRAININGS_TABLE=plataforma-ted-webcontinental-trainings
DYNAMODB_USER_PROGRESS_TABLE=plataforma-ted-webcontinental-user-progress
DYNAMODB_TRAINING_RATINGS_TABLE=plataforma-ted-webcontinental-training-ratings

# S3 Configuration
S3_BUCKET_NAME=plataforma-ted-webcontinental-uploads

# Application Configuration
NEXT_PUBLIC_APP_URL=https://sua-app.vercel.app
JWT_SECRET=seu-jwt-secret-super-seguro
NEXTAUTH_SECRET=seu-nextauth-secret
NEXTAUTH_URL=https://sua-app.vercel.app
```

### 4. Popular Banco com Dados Iniciais

```bash
# Instalar dependências AWS
npm install

# Executar seed
node scripts/seed-aws.js
```

### 5. Deploy na Vercel

#### Via CLI:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel --prod
```

#### Via GitHub:
1. Faça push do código para GitHub
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente na Vercel
4. Deploy automático

## 🔧 Deploy Manual com Terraform

### 1. Instalar Terraform

```bash
# macOS
brew install terraform

# Linux/Windows - baixe de https://terraform.io
```

### 2. Inicializar e Aplicar

```bash
cd infrastructure

# Inicializar Terraform
terraform init

# Planejar mudanças
terraform plan

# Aplicar infraestrutura
terraform apply
```

### 3. Configurar Variáveis

Use os outputs do Terraform para configurar suas variáveis de ambiente.

## 📊 Custos Estimados

### Tier Gratuito AWS (12 meses):
- **DynamoDB**: 25 GB armazenamento + 25 RCU/WCU
- **S3**: 5 GB armazenamento + 20.000 GET + 2.000 PUT
- **IAM**: Gratuito

### Custos Pós Tier Gratuito:
- **DynamoDB**: $0.25/GB/mês + $0.25/milhão RCU
- **S3**: $0.023/GB/mês + $0.0004/1000 requests
- **Data Transfer**: $0.09/GB

## 🔒 Segurança

### Configurações Aplicadas:
- ✅ Encryption at rest (DynamoDB e S3)
- ✅ HTTPS obrigatório
- ✅ IAM roles com permissões mínimas
- ✅ CORS configurado corretamente
- ✅ Tags de aplicação aplicadas

### Boas Práticas:
- Use AWS Secrets Manager para credenciais sensíveis
- Configure CloudTrail para auditoria
- Implemente backup automático
- Configure alertas de custos

## 🔧 Configurações de Produção

### 1. Domínio Personalizado
Configure um domínio personalizado na Vercel:
```bash
vercel domains add seudorminio.com
```

### 2. CDN para S3
Configure CloudFront para melhor performance:
- Distribuição CloudFront apontando para bucket S3
- Cache headers otimizados
- Compressão automática

### 3. Monitoramento
- Configure CloudWatch para logs
- Implemente métricas personalizadas
- Configure alertas de performance

## 🐛 Troubleshooting

### Erro de Permissão DynamoDB:
```bash
# Verificar credenciais
aws sts get-caller-identity

# Verificar policies
aws iam list-attached-role-policies --role-name plataforma-ted-webcontinental-app-role
```

### Erro de Upload S3:
```bash
# Verificar bucket exists
aws s3 ls s3://plataforma-ted-webcontinental-uploads

# Verificar CORS
aws s3api get-bucket-cors --bucket plataforma-ted-webcontinental-uploads
```

### Erro de Build:
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Suporte

Para suporte técnico:
- Email: pietro.medeiros@webcontinental.com.br
- Documentação: Este README
- Logs: Check CloudWatch Logs
- Monitoramento: AWS Console

## 🎯 Próximos Passos

1. Configurar backup automático das tabelas DynamoDB
2. Implementar CDN CloudFront
3. Configurar domínio personalizado
4. Adicionar monitoramento e alertas
5. Implementar testes automatizados
6. Configurar CI/CD pipeline

---

✅ **Deploy concluído com sucesso!**
🌐 **Aplicação rodando na AWS**
📊 **Monitoramento ativo**