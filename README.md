# 🎓 T&D Plataform - Plataforma de Treinamento e Desenvolvimento

Uma plataforma moderna e completa para gerenciamento de treinamentos corporativos, desenvolvida com **Next.js 15**, **TypeScript**, **Tailwind CSS** e **Firebase**.

![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Características Principais

- **🔐 Sistema de Autenticação**: Login seguro com Firebase Auth + modo de teste local
- **👥 Gerenciamento de Usuários**: Perfis de admin e usuário comum
- **📚 Catálogo de Treinamentos**: Visualização e gerenciamento de cursos
- **🎥 Upload de Vídeos**: Sistema de upload para conteúdo de treinamento
- **📱 Design Responsivo**: Interface moderna e adaptável a todos os dispositivos
- **⚡ Performance**: Otimizado com Next.js 15 e Turbopack
- **🧪 Modo de Teste**: Funcionalidade completa sem dependências externas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes de UI modernos
- **React Context API** - Gerenciamento de estado

### Backend/Infraestrutura
- **Firebase Auth** - Autenticação de usuários
- **Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos
- **Firebase Hosting** - Deploy e hospedagem

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Turbopack** - Bundler de alta performance

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.0 ou superior
- **npm** ou **yarn**
- **Git**

## 🚀 Instalação e Configuração Local

### 1. Clone o Repositório

```bash
git clone https://github.com/pietrogmedeiros/T-D_Plataform.git
cd T-D_Plataform
```

### 2. Instale as Dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

> **Nota**: As variáveis do Firebase são opcionais para desenvolvimento local, pois o sistema funciona em **modo de teste** sem Firebase.

### 4. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em: **http://localhost:3000**

## � Sistema de Login

A plataforma possui um sistema híbrido de autenticação que funciona tanto com Firebase quanto em modo de teste local.

### 🧪 Modo de Teste (Padrão para Desenvolvimento Local)

Quando as configurações do Firebase não estão disponíveis, o sistema automaticamente entra em **modo de teste** com usuários pré-configurados:

#### 👤 Usuário Comum
- **Email**: `teste@teste`
- **Senha**: `12345`
- **Perfil**: Usuário padrão com acesso aos treinamentos

#### 👨‍💼 Administrador 1
- **Email**: `admin@teste`
- **Senha**: `admin123`
- **Perfil**: Administrador com acesso total

### 🔥 Modo Firebase (Produção)

Em produção, o sistema utiliza Firebase Auth para autenticação real com:
- Criação de contas
- Reset de senha
- Persistência de sessão
- Sincronização com Firestore

## 📱 Funcionalidades por Perfil

### 👤 Usuário Comum
- ✅ Visualizar catálogo de treinamentos
- ✅ Assistir vídeos de treinamento
- ✅ Acompanhar progresso
- ✅ Avaliar cursos

### 👨‍💼 Administrador
- ✅ Todas as funcionalidades do usuário comum
- ✅ Fazer upload de novos treinamentos
- ✅ Gerenciar usuários
- ✅ Visualizar relatórios e estatísticas
- ✅ Configurar permissões

## 🎯 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── admin/             # Páginas administrativas
│   ├── auth-debug/        # Debug de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── login/             # Página de login
│   └── trainings/         # Páginas de treinamentos
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface
│   ├── Header.tsx        # Cabeçalho da aplicação
│   └── ProtectedRoute.tsx # Proteção de rotas
├── contexts/             # Contextos React
│   ├── AuthContext.tsx   # Gerenciamento de autenticação
│   └── TrainingsContext.tsx # Gerenciamento de treinamentos
├── lib/                  # Bibliotecas e utilitários
│   ├── firebase.ts       # Configuração do Firebase
│   └── utils.ts          # Funções utilitárias
└── types/                # Definições de tipos TypeScript
    └── index.ts          # Tipos principais
```

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build e Produção
npm run build        # Gera build de produção
npm start           # Inicia servidor de produção

# Qualidade de Código
npm run lint        # Executa linting
npm run lint:fix    # Corrige problemas de linting automaticamente

# Tipo de checagem
npx tsc --noEmit    # Verifica tipos TypeScript
```

## 🌐 Deploy

### Firebase Hosting

Para fazer deploy no Firebase Hosting:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Configurar projeto
firebase init hosting

# Build da aplicação
npm run build

# Deploy
firebase deploy
```

### Outras Plataformas

O projeto também é compatível com:
- **Vercel** (recomendado para Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## 🔧 Configuração do Firebase (Opcional)

Para usar o Firebase em produção:

1. **Crie um projeto no [Firebase Console](https://console.firebase.google.com/)**

2. **Configure Authentication**:
   - Ative Email/Password
   - Configure domínios autorizados

3. **Configure Firestore**:
   - Crie banco de dados
   - Configure regras de segurança

4. **Configure Storage**:
   - Ative Firebase Storage
   - Configure regras para upload

5. **Obtenha as credenciais**:
   ```bash
   firebase apps:sdkconfig
   ```

## 🐛 Solução de Problemas

### Erro: "Missing or insufficient permissions"
- **Causa**: Firebase não configurado ou em modo de teste
- **Solução**: Normal em desenvolvimento local. O sistema funciona em modo de teste.

### Erro de build/compilação
```bash
# Limpar cache e reinstalar
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Problemas de autenticação
1. Verifique se está usando as credenciais corretas do modo de teste
2. Limpe o localStorage: `localStorage.clear()`
3. Reinicie o servidor de desenvolvimento

## 📊 Monitoramento

### Logs de Desenvolvimento
O sistema inclui logs detalhados no console para debug:
- Estado de autenticação
- Carregamento de dados
- Erros de Firebase

### Métricas de Produção
Com Firebase Analytics configurado:
- Usuários ativos
- Tempo de sessão
- Interações com treinamentos

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Pietro Medeiros**
- GitHub: [@pietrogmedeiros](https://github.com/pietrogmedeiros)
- Email: pietro.medeiros@webcontinental.com.br

## 🚀 Webcontinental

Desenvolvido para **Webcontinental** - Soluções em Tecnologia e Treinamento Corporativo.

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!**
- **Editor**: React Quill (editor de texto rico)

## 📋 Funcionalidades

### Para Usuários
- ✅ Login/Logout seguro
- ✅ Dashboard com lista de treinamentos
- ✅ Visualização de treinamentos em vídeo
- ✅ Sistema de avaliação (1-5 estrelas)
- ✅ Comentários em treinamentos

### Para Administradores
- ✅ Dashboard administrativo
- ✅ Gerenciamento de usuários
- ✅ Upload de vídeos de treinamento
- ✅ Editor de texto rico para descrições
- ✅ Controle de acesso baseado em roles

## 🛠️ Configuração do Projeto

### 1. Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Firebase

### 2. Configuração do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Configure os seguintes serviços:

#### Authentication
- Vá em "Authentication" > "Sign-in method"
- Ative o provedor "Email/Password"

#### Firestore Database
- Vá em "Firestore Database" > "Create database"
- Escolha "Start in test mode" (depois ajuste as regras de segurança)

#### Storage
- Vá em "Storage" > "Get started"
- Aceite as regras padrão

### 3. Configuração das Variáveis de Ambiente

1. Copie o arquivo `.env.local.example` para `.env.local`:
```bash
cp .env.local.example .env.local
```

2. No Console do Firebase, vá em "Project Settings" > "General" > "Your apps"
3. Adicione um app web e copie as configurações
4. Preencha o arquivo `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
ADMIN_EMAIL=admin@suaempresa.com
```

### 4. Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 👥 Criação do Primeiro Usuário Admin

1. Acesse a aplicação e vá para a página de login
2. No Console do Firebase, vá em "Authentication" > "Users"
3. Clique em "Add user" e crie um usuário com email e senha
4. No Firestore, vá na coleção "users" e crie um documento com o UID do usuário:

```json
{
  "uid": "uid_do_usuario_criado",
  "email": "admin@suaempresa.com",
  "displayName": "Administrador",
  "role": "admin"
}
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx    # Dashboard admin
│   │   ├── users/page.tsx        # Gerenciamento de usuários
│   │   └── upload/page.tsx       # Upload de treinamentos
│   ├── dashboard/page.tsx        # Dashboard do usuário
│   ├── login/page.tsx           # Página de login
│   ├── trainings/[id]/page.tsx  # Página individual do treinamento
│   └── layout.tsx               # Layout principal
├── components/
│   ├── ui/                      # Componentes Shadcn/ui
│   ├── Header.tsx               # Cabeçalho da aplicação
│   └── ProtectedRoute.tsx       # Proteção de rotas
├── contexts/
│   └── AuthContext.tsx          # Context de autenticação
├── lib/
│   ├── firebase.ts              # Configuração do Firebase
│   └── utils.ts                 # Utilitários
└── types/
    └── index.ts                 # Tipos TypeScript
```
