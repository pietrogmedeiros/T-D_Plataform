# Guia de Deploy da Plataforma T&D na AWS

## Recursos AWS já criados

O script `deploy-aws.sh` já criou com sucesso os seguintes recursos:

- **Bucket S3**: plataforma-ted-webcontinental-uploads
- **Tabelas DynamoDB**: 
  - plataforma-ted-webcontinental-users
  - plataforma-ted-webcontinental-trainings
  - plataforma-ted-webcontinental-user-progress
  - plataforma-ted-webcontinental-training-ratings
- **Role IAM**: plataforma-ted-webcontinental-app-role

## Para finalizar o deploy, siga estes passos no Console AWS:

### 1. Deploy no AWS App Runner

1. Acesse o [Console AWS App Runner](https://us-east-2.console.aws.amazon.com/apprunner/home)
2. Clique em "Create service"
3. Escolha "Source code repository" e conecte ao GitHub
4. Selecione o repositório `pietrogmedeiros/T-D_Plataform`
5. Configure as variáveis de ambiente:
   ```
   AWS_REGION=us-east-2
   S3_BUCKET_NAME=plataforma-ted-webcontinental-uploads
   DYNAMODB_USERS_TABLE=plataforma-ted-webcontinental-users
   DYNAMODB_TRAININGS_TABLE=plataforma-ted-webcontinental-trainings
   DYNAMODB_USER_PROGRESS_TABLE=plataforma-ted-webcontinental-user-progress
   DYNAMODB_TRAINING_RATINGS_TABLE=plataforma-ted-webcontinental-training-ratings
   JWT_SECRET=td-platform-super-secret-jwt-key-2025
   ```
6. Configure o build:
   - Runtime: Node.js 18
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Port: 3000

### 2. Associar o Role IAM

1. No console do App Runner, na seção "Security & permissions", atribua a role IAM `plataforma-ted-webcontinental-app-role`
2. Esta role já tem as permissões necessárias para acessar o DynamoDB e o S3

### 3. Iniciar o serviço

1. Revise todas as configurações
2. Clique em "Create & deploy"
3. Aguarde até que o serviço esteja disponível
4. O URL do serviço será exibido na página de detalhes

## Alternativa: Deploy via AWS Amplify Console

Se preferir usar o AWS Amplify, siga estes passos:

1. Acesse o [Console AWS Amplify](https://us-east-2.console.aws.amazon.com/amplify/home)
2. Clique em "New app" > "Host web app"
3. Conecte ao GitHub e selecione o repositório
4. Configure as mesmas variáveis de ambiente listadas acima
5. Na configuração de build, use o arquivo `amplify.yml` com o seguinte conteúdo:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

6. Clique em "Save and deploy"

## Após o deploy

1. Acesse o URL fornecido pelo App Runner ou Amplify
2. Faça login com as credenciais de administrador
3. Verifique se as funcionalidades de upload estão funcionando corretamente