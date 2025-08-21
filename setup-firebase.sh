#!/bin/bash

# Script de configuração da Plataforma T&D
echo "🚀 Configurando Plataforma T&D para Firebase..."

# Verificar se o Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instalando..."
    npm install -g firebase-tools
fi

# Login no Firebase (se necessário)
echo "🔐 Verificando autenticação do Firebase..."
firebase login --reauth

# Selecionar o projeto
echo "📁 Selecionando projeto plataforma-ted-web..."
firebase use plataforma-ted-web

# Verificar se o projeto existe
if [ $? -ne 0 ]; then
    echo "❌ Projeto plataforma-ted-web não encontrado."
    echo "   Criando projeto no Firebase Console..."
    echo "   Acesse: https://console.firebase.google.com/"
    echo "   1. Clique em 'Add project'"
    echo "   2. Nome: 'Plataforma T&D Web'"
    echo "   3. ID: 'plataforma-ted-web'"
    echo "   4. Execute este script novamente após criar o projeto"
    exit 1
fi

# Habilitar serviços necessários
echo "⚙️  Habilitando serviços do Firebase..."
firebase firestore:delete --all-collections --force
firebase firestore:rules-file firestore.rules

# Deploy das regras
echo "🔒 Fazendo deploy das regras de segurança..."
firebase deploy --only firestore:rules,storage

# Configurar Authentication
echo "🔑 Configuração do Authentication:"
echo "   1. Acesse o Firebase Console: https://console.firebase.google.com/project/plataforma-ted-web"
echo "   2. Vá em Authentication > Sign-in method"
echo "   3. Habilite 'Email/Password'"
echo "   4. Opcional: Configure domínios autorizados"

# Configurar Firestore
echo "💾 Configuração do Firestore:"
echo "   1. Acesse o Firebase Console: https://console.firebase.google.com/project/plataforma-ted-web"
echo "   2. Vá em Firestore Database"
echo "   3. Clique em 'Create database'"
echo "   4. Escolha 'Start in production mode'"
echo "   5. Selecione uma localização (ex: southamerica-east1)"

# Configurar Storage
echo "📦 Configuração do Storage:"
echo "   1. Acesse o Firebase Console: https://console.firebase.google.com/project/plataforma-ted-web"
echo "   2. Vá em Storage"
echo "   3. Clique em 'Get started'"
echo "   4. Escolha 'Start in production mode'"
echo "   5. Selecione a mesma localização do Firestore"

# Criar usuário admin inicial
echo "👨‍💼 Após configurar os serviços, crie o primeiro usuário admin:"
echo "   1. Acesse a aplicação"
echo "   2. Use a página de administração para criar usuários"
echo "   3. Ou execute: firebase auth:import users.json (se tiver arquivo de usuários)"

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Configure as variáveis do .env.local com as chaves do seu projeto"
echo "   2. Execute: npm run dev"
echo "   3. Acesse: http://localhost:3000"
echo "   4. Faça login com: admin@teste / admin123 (modo de teste)"
echo ""
echo "🚀 Para fazer deploy:"
echo "   npm run firebase:deploy"
