# Deploy Direto no Console AWS

A infraestrutura já foi criada com sucesso:
- Bucket S3: plataforma-ted-webcontinental-uploads
- Tabelas DynamoDB: users, trainings, user-progress, training-ratings
- Role IAM: plataforma-ted-webcontinental-app-role

## Passos para completar o deploy:

### 1. Completar a conexão GitHub
1. Acesse o [Console AWS App Runner](https://us-east-2.console.aws.amazon.com/apprunner/home)
2. Vá para "Connections" no menu lateral
3. Encontre a conexão "td-platform-connection"
4. Clique em "Complete connection"
5. Autorize a conexão com sua conta GitHub

### 2. Criar o serviço App Runner
1. No console AWS App Runner, clique em "Create service"
2. Em Source, selecione:
   - Provider: GitHub
   - Conexão: td-platform-connection
   - Repositório: pietrogmedeiros/T-D_Plataform
   - Branch: main
3. Em Build settings, selecione:
   - Runtime: Node.js 18
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Port: 3000
4. Em Configure service, defina:
   - Service name: plataforma-ted-webcontinental
   - CPU: 1 vCPU
   - Memory: 2 GB
5. Em Security, atribua:
   - Service role: plataforma-ted-webcontinental-app-role
6. Em Environment variables, adicione:
   ```
   AWS_REGION=us-east-2
   S3_BUCKET_NAME=plataforma-ted-webcontinental-uploads
   DYNAMODB_USERS_TABLE=plataforma-ted-webcontinental-users
   DYNAMODB_TRAININGS_TABLE=plataforma-ted-webcontinental-trainings
   DYNAMODB_USER_PROGRESS_TABLE=plataforma-ted-webcontinental-user-progress
   DYNAMODB_TRAINING_RATINGS_TABLE=plataforma-ted-webcontinental-training-ratings
   JWT_SECRET=td-platform-super-secret-jwt-key-2025
   ADMIN_EMAIL=pietro.medeiros@webcontinental.com.br
   NODE_ENV=production
   ```
7. Clique em "Create & deploy"

### 3. Verificar status do deploy
1. Acompanhe o progresso na página de detalhes do serviço
2. Uma vez concluído, você receberá uma URL para acessar a aplicação
3. Teste o login e o upload de arquivos para confirmar que tudo está funcionando

### 4. Configurar domínio personalizado (opcional)
1. No console do App Runner, vá para seu serviço
2. Clique na aba "Custom domains"
3. Adicione seu domínio personalizado
4. Siga as instruções para configurar os registros DNS

## Verificação final

Após o deploy, acesse a aplicação e verifique:
1. Login como administrador
2. Upload de vídeos
3. Criação de novos treinamentos
4. Atribuição de treinamentos aos usuários

Se tudo estiver funcionando, o deploy está completo!