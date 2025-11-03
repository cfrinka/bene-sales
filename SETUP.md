# Sistema de Estoque e Vendas - Guia de Configuração

Sistema completo para gerenciamento de estoque e vendas com Firebase.

## 📋 Pré-requisitos

- Node.js instalado
- Conta no Firebase (gratuita)

## 🚀 Instalação

### 1. Instalar Dependências

```bash
npm install firebase
```

### 2. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. No menu lateral, vá em **Build** → **Firestore Database**
4. Clique em **Criar banco de dados**
5. Escolha o modo de produção e selecione uma localização
6. Nas configurações do projeto (ícone de engrenagem), vá em **Configurações do projeto**
7. Role até **Seus aplicativos** e clique no ícone da web `</>`
8. Registre seu app e copie as credenciais do Firebase

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com suas credenciais do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 4. Configurar Firebase Storage

1. No Firebase Console, vá em **Build** → **Storage**
2. Clique em **Começar**
3. Escolha as regras de segurança (pode usar o modo de teste por enquanto)
4. Selecione uma localização

### 5. Configurar Regras do Firestore

No Firebase Console, vá em **Firestore Database** → **Regras** e adicione:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /estoque/{document=**} {
      allow read, write: if true;
    }
    match /sales/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 6. Configurar Regras do Storage

No Firebase Console, vá em **Storage** → **Regras** e adicione:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**Nota:** Estas regras permitem acesso total. Para produção, implemente autenticação e regras mais restritivas.

### 7. Iniciar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📱 Funcionalidades

### 🏠 Página Inicial
- Dashboard com navegação para todas as seções

### 💰 Vendas (`/vendas`)
- Interface simples e intuitiva
- Clique no produto desejado
- Selecione o tamanho disponível
- Escolha a quantidade
- Clique em **VENDER**
- Estoque é atualizado automaticamente

### 📦 Estoque (`/estoque`)
- Adicionar novos produtos
- Upload de imagens dos produtos
- Editar produtos existentes
- Definir preços
- Gerenciar tamanhos (P, M, G, GG, G1)
- Controlar quantidades por tamanho
- Excluir produtos

### 📊 Histórico (`/historico`)
- Visualizar todas as vendas realizadas
- Resumo com totais
- Detalhes de cada venda (data, produto, tamanho, quantidade, valor)

## 🗂️ Estrutura do Banco de Dados

### Collection: `estoque`
```typescript
{
  id: string,
  name: string,
  price: number,
  imageUrl?: string,
  sizes: {
    "P": number,
    "M": number,
    "G": number,
    "GG": number,
    "G1": number
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `sales`
```typescript
{
  id: string,
  productId: string,
  productName: string,
  size: string,
  quantity: number,
  price: number,
  total: number,
  timestamp: Timestamp
}
```

## 🔒 Segurança

Para ambiente de produção:

1. **Implemente autenticação** usando Firebase Auth
2. **Configure regras de segurança** no Firestore
3. **Valide dados** no lado do servidor usando Cloud Functions
4. **Limite acesso** por usuário/função

Exemplo de regras mais seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /estoque/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /sales/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **Firebase Firestore** - Banco de dados NoSQL
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização

## 📝 Notas

- O sistema usa transações do Firestore para garantir consistência ao processar vendas
- Vendas só são concluídas se houver estoque suficiente
- Todas as atualizações de estoque são atômicas e seguras

## 🐛 Solução de Problemas

### Erro: "Firebase not initialized"
- Verifique se o arquivo `.env.local` está configurado corretamente
- Reinicie o servidor de desenvolvimento

### Erro: "Permission denied"
- Verifique as regras do Firestore
- Certifique-se de que as collections `estoque` e `sales` estão criadas

### Produtos não aparecem
- Adicione produtos pela página `/estoque` primeiro
- Verifique o console do navegador para erros

## 📞 Suporte

Para dúvidas ou problemas, verifique:
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
