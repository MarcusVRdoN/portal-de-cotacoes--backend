# 🏥 Portal de Cotações - Backend API

Uma API robusta e escalável para gestão de cotações de produtos médicos e hospitalares, desenvolvida com arquitetura serverless na AWS usando Node.js, TypeScript e Prisma ORM.

## 📋 Sobre o Projeto

O Portal de Cotações é um sistema completo que conecta clientes que necessitam de produtos médicos e hospitalares com fornecedores especializados. O backend fornece uma API RESTful segura e eficiente que gerencia todo o fluxo desde a solicitação de cotações até a finalização de pedidos.

### 🎯 Objetivos
- Facilitar o processo de cotações entre clientes e fornecedores
- Centralizar a gestão de produtos médicos e hospitalares
- Automatizar o controle de estoque e pedidos
- Proporcionar uma API escalável e performática na nuvem

### 🏗️ Arquitetura
- **Serverless**: Deploy na AWS Lambda com API Gateway
- **Database**: PostgreSQL hospedado no Neon
- **ORM**: Prisma para tipagem e queries seguras
- **Autenticação**: JWT com middleware de autorização
- **Cloud**: Infraestrutura como código via Serverless Framework

## 🚀 Configuração e Instalação

### Pré-requisitos
- **Node.js** 16+ ou superior
- **npm** ou **yarn**
- **Git** para controle de versão
- **AWS CLI** configurado (para deploy)
- Conta no **Neon** (banco PostgreSQL)

### 1. Clone do Repositório

```bash
git clone https://github.com/MarcusVRdoN/portal-de-cotacoes--backend.git
cd portal-de-cotacoes--backend
```

### 2. Instalação das Dependências

```bash
npm install
```

### 3. Configuração do Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL=postgresql://admin:npg_7ZPRvlcWSdI6@ep-raspy-flower-a5hew2xr-pooler.us-east-2.aws.neon.tech/portal?sslmode=require&channel_binding=require

# JWT Secret (gere uma chave segura para produção)
JWT_SECRET=9d27eba302a36d447bb6af84f288e9b5220132fb03da731f30ed951b4a95495611fd43a6cf188889d57b7bbdafce470555facd52baa1ae7b6ae055bc251d48da

# AWS PowerTools (desenvolvimento)
POWERTOOLS_DEV=true
POWERTOOLS_LOGGER_LOG_EVENT=false
```

### 4. Configuração do Banco de Dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Aplicar migrações (se houver)
npx prisma db push --schema=./src/libs/prisma/schema.prisma

# Popular banco com dados de teste
npx prisma db seed
```

### 5. Execução Local

```bash
# Desenvolvimento local
npm run dev

# O servidor estará disponível em http://localhost:4000
```

### 6. Visualizar Banco de Dados

```bash
# Abrir Prisma Studio
npm run database:preview
```

## 🌐 API Endpoints

### 🔐 Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/auth/signup` | Cadastrar novo usuário | ❌ |
| `POST` | `/auth/signin` | Login com email/senha | ❌ |

### 👥 Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/users` | Listar usuários (Admin) | ✅ |
| `GET` | `/users/{id}` | Buscar usuário por ID | ✅ |
| `PUT` | `/users/{id}` | Atualizar usuário (Admin) | ✅ |
| `DELETE` | `/users/{id}` | Excluir usuário (Admin) | ✅ |
| `GET` | `/users/profile` | Perfil do usuário logado | ✅ |
| `PUT` | `/users/profile` | Atualizar perfil próprio | ✅ |
| `GET` | `/users/report` | Relatório de usuários | ✅ |

### 🛍️ Produtos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/products` | Cadastrar produto (Admin) | ✅ |
| `GET` | `/products` | Listar produtos | ✅ |
| `GET` | `/products/{id}` | Buscar produto por ID | ✅ |
| `PUT` | `/products/{id}` | Atualizar produto (Admin) | ✅ |
| `DELETE` | `/products/{id}` | Excluir produto (Admin) | ✅ |

### 📋 Cotações

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/quotes` | Solicitar cotação (Cliente) | ✅ |
| `GET` | `/quotes` | Listar cotações | ✅ |
| `GET` | `/quotes/{id}` | Buscar cotação por ID | ✅ |
| `PUT` | `/quotes/{id}/status` | Atualizar status da cotação | ✅ |
| `POST` | `/quotes/{id}/respond` | Responder cotação (Fornecedor) | ✅ |
| `GET` | `/quotes/suppliers` | Listar fornecedores | ✅ |
| `GET` | `/quotes/report` | Relatório de cotações | ✅ |

### 🛒 Pedidos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/orders` | Criar pedido (Cliente) | ✅ |
| `GET` | `/orders` | Listar pedidos | ✅ |
| `GET` | `/orders/{id}` | Buscar pedido por ID | ✅ |
| `PUT` | `/orders/{id}` | Atualizar pedido | ✅ |
| `GET` | `/orders/report` | Relatório de pedidos | ✅ |

### 📦 Estoque

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `PUT` | `/stock/products/{id}` | Atualizar estoque (Admin) | ✅ |
| `GET` | `/stock/report/low` | Produtos com estoque baixo | ✅ |
| `GET` | `/stock/report` | Relatório geral de estoque | ✅ |

## 🔑 Autenticação e Autorização

### Sistema de Tipos de Usuário

```typescript
enum TipoUsuario {
  ADMIN    // Acesso completo ao sistema
  CLIENT   // Pode solicitar cotações e fazer pedidos
  SUPPLIER // Pode responder cotações
}
```

### Fluxo de Autenticação

1. **Login**: `POST /auth/signin`
2. **Token JWT**: Retornado no response
3. **Header**: `Authorization: Bearer {token}`
4. **Validação**: Middleware verifica token em cada request

### Usuários de Teste

| Email | Senha | Tipo | Permissões |
|-------|-------|------|------------|
| `admin@portal.com` | `123456` | **ADMIN** | Acesso completo ao sistema |
| `marcus.nascimento@rede.ulbra.br` | `123456` | **CLIENT** | Solicitar cotações e pedidos |
| `maria.silva@pharmadist.com.br` | `123456` | **SUPPLIER** | Responder cotações |

## 🗄️ Estrutura do Banco de Dados

### Principais Entidades

```sql
-- Usuários do sistema
usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  senha VARCHAR NOT NULL,
  tipo_usuario ENUM('ADMIN', 'CLIENT', 'SUPPLIER')
)

-- Fornecedores registrados
fornecedores (
  id_fornecedor SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  contato VARCHAR NOT NULL
)

-- Catálogo de produtos
produtos (
  id_produto SERIAL PRIMARY KEY,
  nome_produto VARCHAR NOT NULL,
  descricao TEXT,
  estoque INTEGER DEFAULT 0
)

-- Solicitações de cotação
cotacoes (
  id_cotacao SERIAL PRIMARY KEY,
  data_solicitacao TIMESTAMP DEFAULT NOW(),
  status ENUM('PENDENTE', 'RESPONDIDA', 'CANCELADA', 'GANHA'),
  id_cliente INTEGER REFERENCES usuarios(id_usuario)
)

-- Respostas dos fornecedores
respostas_cotacao (
  id_resposta SERIAL PRIMARY KEY,
  id_cotacao INTEGER REFERENCES cotacoes(id_cotacao),
  id_fornecedor INTEGER REFERENCES fornecedores(id_fornecedor),
  preco_unitario DECIMAL NOT NULL,
  prazo_entrega VARCHAR NOT NULL
)

-- Pedidos finalizados
pedidos (
  id_pedido SERIAL PRIMARY KEY,
  data_pedido TIMESTAMP DEFAULT NOW(),
  valor_total DECIMAL NOT NULL,
  id_cliente INTEGER REFERENCES usuarios(id_usuario)
)
```

### Relacionamentos

- **1:N** - Usuario → Cotacoes (cliente)
- **1:N** - Usuario → Pedidos (cliente)
- **1:N** - Cotacao → RespostaCotacao
- **1:N** - Fornecedor → RespostaCotacao
- **1:N** - Pedido → ItemPedido
- **N:M** - Cotacao ↔ Produto (via ItemCotacao)
- **N:M** - Pedido ↔ Produto (via ItemPedido)

## 🛠️ Tecnologias e Dependências

### Core Dependencies

```json
{
  "@prisma/client": "^6.10.1",        // ORM para PostgreSQL
  "jsonwebtoken": "^9.0.2",           // Autenticação JWT
  "@aws-lambda-powertools/logger": "^2.22.0", // Logging estruturado
  "@middy/core": "^5.5.1"             // Middleware para Lambda
}
```

### Development Tools

```json
{
  "typescript": "^5.8.3",             // Linguagem principal
  "prisma": "^6.10.1",                // CLI do Prisma
  "serverless": "^3.40.0",            // Framework serverless
  "serverless-esbuild": "^1.55.1",    // Bundler otimizado
  "serverless-offline": "^13.9.0",    // Desenvolvimento local
  "esbuild": "^0.25.5"                // Compilador ultra-rápido
}
```

### Arquitetura Serverless

- **Runtime**: Node.js 18+
- **Bundler**: esbuild (compilação rápida)
- **Binary Targets**: Native + RHEL OpenSSL 3.0.x (AWS Lambda)
- **Memory**: 1024MB por função Lambda
- **Timeout**: 30 segundos

## 📊 Exemplos de Uso da API

### 1. Fazer Login

```bash
curl -X POST https://2kb8y5mqe6.execute-api.us-east-1.amazonaws.com/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@portal.com",
    "password": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 1,
    "nome": "Administrador",
    "email": "admin@portal.com",
    "tipo_usuario": "ADMIN"
  }
}
```

### 2. Criar Produto (Admin)

```bash
curl -X POST https://2kb8y5mqe6.execute-api.us-east-1.amazonaws.com/products \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Seringa 10ml",
    "description": "Seringa descartável estéril 10ml",
    "quantity": 1000
  }'
```

### 3. Solicitar Cotação (Cliente)

```bash
curl -X POST https://2kb8y5mqe6.execute-api.us-east-1.amazonaws.com/quotes \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id_produto": 1,
        "quantidade": 50
      },
      {
        "id_produto": 3,
        "quantidade": 20
      }
    ]
  }'
```

### 4. Responder Cotação (Fornecedor)

```bash
curl -X POST https://2kb8y5mqe6.execute-api.us-east-1.amazonaws.com/quotes/1/respond \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "unitPrice": 2.50,
    "deliveryTime": "5 dias úteis"
  }'
```

### 5. Criar Pedido (Cliente)

```bash
curl -X POST https://2kb8y5mqe6.execute-api.us-east-1.amazonaws.com/orders \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id_produto": 1,
        "quantidade": 30,
        "valor_unitario": 2.50
      }
    ]
  }'
```

## 🚀 Deploy e Produção

### Deploy na AWS

```bash
# Deploy ambiente de desenvolvimento
npm run deploy

# Deploy ambiente de produção
npm run deploy:prod
```

### URLs de Produção

**Base URL**: `https://2kb8y5mqe6.execute-api.us-east-1.amazonaws.com`

### Monitoramento

- **CloudWatch**: Logs e métricas das funções Lambda
- **AWS X-Ray**: Tracing distribuído (se habilitado)
- **Prisma Studio**: Visualização do banco de dados

### Variáveis de Ambiente (Produção)

```env
DATABASE_URL=postgresql://user:pass@prod-db.neon.tech/portal
JWT_SECRET=chave-super-secreta-de-producao
NODE_ENV=production
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor local com hot reload
npm run build           # Verificar compilação TypeScript

# Deploy
npm run deploy          # Deploy dev na AWS
npm run deploy:prod     # Deploy produção na AWS

# Banco de Dados
npm run database:preview      # Abrir Prisma Studio
npm run prisma:generate      # Gerar cliente Prisma

# Limpeza
npm run clean           # Limpar arquivos de build
npm run clean:all       # Limpeza completa + reinstalar deps
```

## 🔍 Casos de Uso Implementados

### Para Clientes
1. **Realizar Login** - Autenticação segura no sistema
2. **Solicitar Cotação** - Especificar produtos e quantidades desejadas
3. **Consultar Cotação** - Acompanhar status e respostas recebidas
4. **Realizar Pedido** - Finalizar compra baseada nas cotações

### Para Fornecedores
1. **Realizar Login** - Acesso ao painel de fornecedor
2. **Visualizar Cotações** - Ver solicitações recebidas
3. **Responder Cotação** - Informar preços e prazos de entrega

### Para Administradores
1. **Cadastrar Usuário** - Registrar clientes e fornecedores
2. **Gerenciar Produtos** - CRUD completo do catálogo
3. **Gerenciar Estoque** - Controle de entradas e saídas
4. **Gerar Relatórios** - Dashboards e métricas do sistema

## 📈 Performance e Escalabilidade

### Otimizações Implementadas

- **Serverless**: Auto-scaling baseado na demanda
- **Connection Pooling**: Gerenciamento eficiente de conexões DB
- **Prisma**: Queries otimizadas e type-safe
- **esbuild**: Bundling ultra-rápido
- **Binary Targets**: Otimização para AWS Lambda

### Métricas de Performance

- **Cold Start**: ~2-3 segundos
- **Warm Response**: ~100-300ms
- **Database Latency**: ~50-100ms (Neon us-east-2)
- **Memory Usage**: ~100-200MB por função

## 🧪 Testes e Desenvolvimento

### Testando Endpoints Localmente

Use os arquivos `.http` na pasta raiz:

- `auth.http` - Testes de autenticação
- `users.http` - Operações de usuários
- `products.http` - Gestão de produtos
- `quotes.http` - Cotações e respostas
- `orders.http` - Pedidos e itens
- `stock.http` - Controle de estoque

### Executando com VS Code REST Client

1. Instale a extensão "REST Client"
2. Abra qualquer arquivo `.http`
3. Clique em "Send Request" acima de cada endpoint

### Ambiente de Desenvolvimento

```bash
# Terminal 1: API local
npm run dev

# Terminal 2: Prisma Studio
npm run database:preview

# Terminal 3: Logs em tempo real
npx sls logs -f signIn --tail
```

## 🐛 Troubleshooting

### Problemas Comuns

#### ❌ Erro de Conexão com Banco

```bash
# Verificar URL de conexão
echo $DATABASE_URL

# Testar conexão
npx prisma db push --schema=./src/libs/prisma/schema.prisma
```

#### ❌ Erro de Compilação TypeScript

```bash
# Limpar e reinstalar
npm run clean:all

# Verificar tipagens
npm run build
```

#### ❌ Erro de Deploy AWS

```bash
# Verificar credenciais AWS
aws sts get-caller-identity

# Limpar deploy anterior
rm -rf .serverless
npm run deploy
```

#### ❌ Token JWT Inválido

```bash
# Verificar secret no .env
echo $JWT_SECRET

# Fazer novo login
curl -X POST localhost:4000/auth/signin \
  -d '{"email":"admin@portal.com","password":"123456"}'
```

## 📞 Suporte e Contato

### Desenvolvedor
**Marcus Vinícius Ribeiro do Nascimento**
- 📧 Email: marcus.nascimento@rede.ulbra.br
- 🎓 Universidade: ULBRA - Educação a Distância
- 📚 Curso: Tecnologia em Análise e Desenvolvimento de Sistemas

### Projeto Acadêmico
Este projeto foi desenvolvido como trabalho de conclusão da disciplina **Projeto Tecnológico em Desenvolvimento de Sistemas** da Universidade Luterana do Brasil (ULBRA).

### Recursos Adicionais
- 📖 [Documentação do Prisma](https://www.prisma.io/docs/)
- 🌐 [Serverless Framework](https://www.serverless.com/framework/docs)
- ☁️ [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- 🐘 [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos como parte do curso de Tecnologia em Análise e Desenvolvimento de Sistemas da ULBRA.