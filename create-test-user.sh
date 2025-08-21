#!/bin/bash

# Script para criar usuário teste no Firebase
echo "Criando usuário de teste no Firebase..."

# Email e senha do usuário de teste
EMAIL="pietro.medeiros@webcontinental.com.br"
PASSWORD="123456"

echo "Tentando criar usuário: $EMAIL"

# Usar Firebase Admin SDK seria ideal, mas vamos criar via interface web
echo "Acesse: https://console.firebase.google.com/project/plataforma-ted-web/authentication/users"
echo "E crie um usuário com:"
echo "Email: $EMAIL"
echo "Senha: $PASSWORD"
echo ""
echo "Ou use credenciais de teste:"
echo "Email: teste@teste"
echo "Senha: 12345"
echo "OU"
echo "Email: admin@teste"
echo "Senha: admin123"
