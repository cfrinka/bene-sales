# 📸 Guia de Upload de Imagens

## Como Funciona

O sistema agora suporta upload de imagens para produtos usando Firebase Storage.

## 🎯 Funcionalidades

### Upload de Imagem
- Ao adicionar ou editar um produto, você pode fazer upload de uma imagem
- Formatos suportados: JPG, PNG, GIF, WebP, etc.
- Preview da imagem antes de salvar
- Imagens são armazenadas no Firebase Storage

### Visualização
- **Página de Estoque**: Miniatura (60x60px) na tabela de produtos
- **Página de Vendas**: 
  - Lista de produtos: 80x80px
  - Detalhes da venda: 100x100px
- Placeholder "Sem imagem" quando não há foto

## 🔧 Configuração Necessária

### 1. Ativar Firebase Storage

No Firebase Console:
1. Vá em **Build** → **Storage**
2. Clique em **Começar**
3. Escolha o modo de teste (ou configure regras personalizadas)
4. Selecione a mesma localização do Firestore

### 2. Configurar Regras de Segurança

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

### 3. Verificar Configuração do Next.js

O arquivo `next.config.ts` já está configurado para aceitar imagens do Firebase Storage:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
      pathname: '/**',
    },
  ],
}
```

## 📝 Como Usar

### Adicionar Produto com Imagem

1. Vá para `/estoque`
2. Clique em **+ Novo Produto**
3. Preencha nome e preço
4. Clique em **Escolher arquivo** no campo "Imagem do Produto"
5. Selecione uma imagem do seu computador
6. Veja o preview da imagem
7. Configure os tamanhos e quantidades
8. Clique em **Salvar**

### Editar Imagem de Produto

1. Na página `/estoque`, clique em **Editar** no produto
2. A imagem atual será exibida (se houver)
3. Clique em **Escolher arquivo** para trocar a imagem
4. Selecione uma nova imagem
5. Clique em **Salvar**

## 🗂️ Estrutura de Armazenamento

As imagens são salvas no Firebase Storage com a seguinte estrutura:

```
/products/
  ├── {productId}.jpg
  ├── {productId}.png
  └── ...
```

Cada produto tem sua imagem nomeada com o ID do produto, facilitando a organização.

## ⚠️ Notas Importantes

1. **Tamanho das Imagens**: Não há limite de tamanho configurado, mas recomenda-se usar imagens otimizadas (máx. 2MB)
2. **Formatos**: Aceita qualquer formato de imagem suportado pelo navegador
3. **Substituição**: Ao fazer upload de uma nova imagem, a antiga é substituída automaticamente
4. **Opcional**: O campo de imagem é opcional - produtos podem ser criados sem imagem

## 🔒 Segurança em Produção

Para produção, configure regras mais restritivas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Apenas usuários autenticados
    }
  }
}
```

## 🐛 Solução de Problemas

### Imagem não aparece
- Verifique se o Firebase Storage está ativado
- Confirme que as regras de segurança permitem leitura
- Verifique o console do navegador para erros

### Erro ao fazer upload
- Confirme que as regras permitem escrita
- Verifique se o arquivo é uma imagem válida
- Certifique-se de que há espaço disponível no Firebase (plano gratuito: 5GB)

### Imagem carrega lentamente
- Otimize as imagens antes do upload (use ferramentas como TinyPNG)
- Considere redimensionar imagens grandes (recomendado: máx. 800x800px)
