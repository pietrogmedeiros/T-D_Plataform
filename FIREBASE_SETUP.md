# 🔥 Configuração do Firebase Console

## 📋 Checklist de Configuração

### 1. **Criar Projeto no Firebase**
- [ ] Acesse [Firebase Console](https://console.firebase.google.com/)
- [ ] Clique em "Adicionar projeto"
- [ ] Nome: `Plataforma T&D Web`
- [ ] ID do projeto: `plataforma-ted-web`
- [ ] Desabilite Google Analytics (opcional)
- [ ] Clique em "Criar projeto"

### 2. **Configurar Authentication**
- [ ] Vá em **Authentication** > **Sign-in method**
- [ ] Clique em **E-mail/senha**
- [ ] Habilite **E-mail/senha**
- [ ] Habilite **Link de e-mail (login sem senha)** (opcional)
- [ ] Em **Domínios autorizados**, adicione:
  - `localhost`
  - `seu-dominio.com` (para produção)
- [ ] Clique em **Salvar**

### 3. **Configurar Firestore Database**
- [ ] Vá em **Firestore Database**
- [ ] Clique em **Criar banco de dados**
- [ ] Escolha **Iniciar no modo de produção**
- [ ] Localização: **southamerica-east1** (São Paulo)
- [ ] Clique em **Concluído**

### 4. **Configurar Storage**
- [ ] Vá em **Storage**
- [ ] Clique em **Começar**
- [ ] Escolha **Iniciar no modo de produção**
- [ ] Localização: **southamerica-east1** (mesma do Firestore)
- [ ] Clique em **Concluído**

### 5. **Obter Credenciais da Aplicação Web**
- [ ] Vá em **Configurações do projeto** (ícone de engrenagem)
- [ ] Aba **Geral**
- [ ] Seção **Seus aplicativos**
- [ ] Clique em **</>** (Web)
- [ ] Nome do app: `Plataforma T&D Web`
- [ ] Marque **Configurar Firebase Hosting** (opcional)
- [ ] Clique em **Registrar app**
- [ ] **COPIE as configurações** exibidas:

```javascript
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "plataforma-ted-web.firebaseapp.com",
  projectId: "plataforma-ted-web",
  storageBucket: "plataforma-ted-web.appspot.com",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};
```

### 6. **Atualizar arquivo .env.local**
Substitua os valores no arquivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=SUA_API_KEY_AQUI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=plataforma-ted-web.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=plataforma-ted-web
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=plataforma-ted-web.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=SEU_SENDER_ID_AQUI
NEXT_PUBLIC_FIREBASE_APP_ID=SEU_APP_ID_AQUI
```

### 7. **Configurar Regras de Segurança**

#### **Firestore Rules**
- [ ] Vá em **Firestore Database** > **Regras**
- [ ] Substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Regras para treinamentos
    match /trainings/{trainingId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regras para avaliações
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### **Storage Rules**
- [ ] Vá em **Storage** > **Regras**
- [ ] Substitua o conteúdo por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Arquivos de treinamento
    match /trainings/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Arquivos pessoais dos usuários
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### 8. **Criar Primeiro Usuário Admin**

#### **Opção A: Via Console Firebase**
- [ ] Vá em **Authentication** > **Usuários**
- [ ] Clique em **Adicionar usuário**
- [ ] E-mail: `admin@plataforma-ted-web.com`
- [ ] Senha: `admin123456` (ou senha segura)
- [ ] Copie o **UID** gerado

#### **Opção B: Via Aplicação**
- [ ] Acesse a aplicação: `http://localhost:3000`
- [ ] Use as credenciais de teste: `admin@teste` / `admin123`
- [ ] Vá em **Admin** > **Usuários**
- [ ] Crie um usuário administrador

### 9. **Configurar Usuário Admin no Firestore**
- [ ] Vá em **Firestore Database** > **Dados**
- [ ] Crie coleção `users`
- [ ] Adicione documento com ID = UID do usuário admin
- [ ] Campos:
  ```json
  {
    "uid": "UID_DO_USUARIO",
    "email": "admin@plataforma-ted-web.com",
    "displayName": "Administrador",
    "role": "admin"
  }
  ```

### 10. **Configurar Índices (Opcional)**
- [ ] Vá em **Firestore Database** > **Índices**
- [ ] Os índices serão criados automaticamente conforme necessário
- [ ] Ou use o arquivo `firestore.indexes.json` incluído no projeto

### 11. **Testar Configuração**
- [ ] Reinicie o servidor: `npm run dev`
- [ ] Acesse: `http://localhost:3000`
- [ ] Faça login com o usuário admin criado
- [ ] Teste upload de treinamento
- [ ] Verifique se aparecem no dashboard

### 12. **Configurar Hosting (Opcional)**
- [ ] Vá em **Hosting**
- [ ] Clique em **Começar**
- [ ] Instale Firebase CLI: `npm install -g firebase-tools`
- [ ] Execute: `firebase login`
- [ ] Execute: `firebase init hosting`
- [ ] Configure pasta pública: `out`
- [ ] Configure como SPA: `Yes`

## 🔧 **Scripts Úteis**

```bash
# Deploy completo
npm run firebase:deploy

# Deploy apenas regras
npm run firebase:rules

# Deploy apenas hosting
npm run firebase:hosting

# Build para produção
npm run build
```

## ⚠️ **Problemas Comuns**

### **Firebase não inicializa**
- Verifique se todas as variáveis estão no `.env.local`
- Reinicie o servidor após alterar variáveis

### **Erro de permissões**
- Verifique se as regras foram aplicadas corretamente
- Confirme se o usuário tem role `admin` no Firestore

### **Upload não funciona**
- Verifique as regras do Storage
- Confirme se o bucket está na mesma região

## ✅ **Configuração Completa**

Após seguir todos os passos:
1. ✅ Firebase configurado
2. ✅ Authentication funcionando
3. ✅ Firestore operacional
4. ✅ Storage configurado
5. ✅ Regras de segurança aplicadas
6. ✅ Usuário admin criado
7. ✅ Aplicação testada

**🎉 Sua Plataforma T&D está pronta para uso!**
