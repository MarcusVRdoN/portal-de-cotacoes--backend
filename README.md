# 💼 Portal de Cotações

Sistema de gerenciamento de cotações e pedidos desenvolvido para facilitar a comunicação entre clientes e fornecedores.

## 📋 Sobre o Projeto

O Portal de Cotações é uma plataforma web que conecta clientes que precisam de produtos com fornecedores que podem atendê-los. O sistema permite:

- **Clientes** podem solicitar cotações especificando produtos e quantidades
- **Fornecedores** respondem com preços e prazos de entrega
- **Administradores** gerenciam todo o sistema e controlam estoques
- Processo completo desde a cotação até o pedido final

## 🎯 Funcionalidades Principais

### Para Clientes
- ✅ Fazer login no sistema
- ✅ Solicitar cotações de produtos
- ✅ Consultar status das cotações
- ✅ Realizar pedidos baseados nas respostas

### Para Fornecedores  
- ✅ Fazer login no sistema
- ✅ Visualizar solicitações de cotação
- ✅ Responder cotações com preços e prazos

### Para Administradores
- ✅ Cadastrar novos usuários
- ✅ Gerenciar produtos e estoque
- ✅ Acompanhar todo o processo
- ✅ Gerar relatórios do sistema

## 🛠️ Tecnologias Utilizadas

### Backend (Servidor)
- **Node.js** - Plataforma de desenvolvimento
- **TypeScript** - Linguagem de programação
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Prisma** - Para conectar com o banco
- **JWT** - Segurança e autenticação

### Ferramentas de Desenvolvimento
- **Visual Studio Code** - Editor de código
- **Git & GitHub** - Controle de versão
- **Prisma Studio** - Visualizar banco de dados

## 📦 Como Instalar e Executar

### Pré-requisitos
Você precisa ter instalado:
- Node.js (versão 16 ou mais recente)
- PostgreSQL (banco de dados)
- Git

### Passo a Passo

1. **Baixar o projeto**
```bash
git clone https://github.com/seu-usuario/portal-cotacoes-backend.git
cd portal-cotacoes-backend
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar banco de dados**
Crie um arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/portal_cotacoes"
JWT_SECRET="sua-chave-secreta"
PORT=4000
```

4. **Preparar banco de dados**
```bash
npx prisma db push
npm run prisma:seed
```

5. **Iniciar o servidor**
```bash
npm run dev
```

O sistema estará rodando em: `http://localhost:4000`

## 🌐 Como Usar a API

### Fazer Login
```bash
curl -X POST http://localhost:4000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","senha":"123456"}'
```

### Listar Produtos  
```bash
curl -X GET http://localhost:4000/api/stock/products \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Solicitar Cotação
```bash
curl -X POST http://localhost:4000/api/quotes \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"observacoes":"Preciso de parafusos"}'
```

## 👥 Usuários de Teste

O sistema já vem com usuários pré-cadastrados para teste:

| Email | Senha | Tipo | O que pode fazer |
|-------|-------|------|------------------|
| `admin@portal.com` | `123456` | Admin | Tudo no sistema |
| `joao.cliente@email.com` | `123456` | Cliente | Solicitar cotações e pedidos |
| `maria.cliente@email.com` | `123456` | Cliente | Solicitar cotações e pedidos |

## 📊 Estrutura do Banco de Dados

O sistema possui as seguintes tabelas principais:

- **usuarios** - Dados dos usuários (clientes, fornecedores, admin)
- **fornecedores** - Informações das empresas fornecedoras
- **produtos** - Catálogo de produtos disponíveis  
- **cotacoes** - Solicitações feitas pelos clientes
- **respostas_cotacao** - Respostas dos fornecedores
- **pedidos** - Pedidos finalizados
- **itens_pedido** - Produtos específicos de cada pedido

## 🔐 Segurança

- Todas as senhas são criptografadas
- Sistema usa tokens JWT para autenticação
- Controle de permissões por tipo de usuário
- Validação de dados em todas as operações

## 📱 Principais Rotas da API

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/auth/signin` | POST | Fazer login |
| `/api/quotes` | GET | Listar cotações |
| `/api/quotes` | POST | Solicitar cotação |
| `/api/orders` | GET | Listar pedidos |
| `/api/orders` | POST | Criar pedido |
| `/api/stock/products` | GET | Listar produtos |

## 🚀 Verificar se está Funcionando

Teste se o sistema está rodando:
```bash
curl http://localhost:4000/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "Portal de Cotações API está funcionando"
}
```

## 📂 Organização do Código

```
portal-cotacoes-backend/
├── src/
│   ├── controllers/     # Lógica do sistema
│   ├── routes/         # Rotas da API  
│   ├── middleware/     # Segurança
│   └── app.ts         # Configuração principal
├── prisma/
│   ├── schema.prisma  # Estrutura do banco
│   └── seed.ts       # Dados de exemplo
└── README.md         # Este arquivo
```

## 🔧 Comandos Úteis

```bash
# Iniciar desenvolvimento
npm run dev

# Ver banco de dados  
npx prisma studio

# Recriar dados de exemplo
npm run prisma:seed

# Verificar saúde da API
curl http://localhost:4000/api/health
```

## 🎯 Próximos Passos

1. **Frontend** - Criar interface web para os usuários
2. **Melhorias** - Adicionar mais funcionalidades
3. **Deploy** - Publicar em servidor na nuvem
4. **Testes** - Adicionar testes automatizados

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua funcionalidade
3. Faça suas alterações
4. Teste tudo
5. Envie um pull request

## 📞 Suporte

Se precisar de ajuda:
- Abra uma issue no GitHub
- Verifique a documentação da API
- Teste com os usuários de exemplo

---

**Portal de Cotações - Conectando clientes e fornecedores de forma simples e eficiente** 🚀