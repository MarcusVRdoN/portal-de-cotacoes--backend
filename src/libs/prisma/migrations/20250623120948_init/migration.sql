-- CreateEnum
CREATE TYPE "StatusCotacao" AS ENUM ('PENDENTE', 'RESPONDIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ADMIN', 'CLIENT', 'SUPPLIER');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo_usuario" "TipoUsuario" NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id_fornecedor" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id_fornecedor")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id_produto" SERIAL NOT NULL,
    "nome_produto" TEXT NOT NULL,
    "descricao" TEXT,
    "estoque" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id_produto")
);

-- CreateTable
CREATE TABLE "cotacoes" (
    "id_cotacao" SERIAL NOT NULL,
    "data_solicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusCotacao" NOT NULL DEFAULT 'PENDENTE',
    "id_cliente" INTEGER NOT NULL,

    CONSTRAINT "cotacoes_pkey" PRIMARY KEY ("id_cotacao")
);

-- CreateTable
CREATE TABLE "respostas_cotacao" (
    "id_resposta" SERIAL NOT NULL,
    "id_cotacao" INTEGER NOT NULL,
    "id_fornecedor" INTEGER NOT NULL,
    "preco_unitario" DOUBLE PRECISION NOT NULL,
    "prazo_entrega" TEXT NOT NULL,

    CONSTRAINT "respostas_cotacao_pkey" PRIMARY KEY ("id_resposta")
);

-- CreateTable
CREATE TABLE "itens_cotacao" (
    "id_cotacao" INTEGER NOT NULL,
    "id_produto" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "itens_cotacao_pkey" PRIMARY KEY ("id_cotacao","id_produto")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" SERIAL NOT NULL,
    "data_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor_total" DOUBLE PRECISION NOT NULL,
    "id_cliente" INTEGER NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id_item_pedido" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_produto" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor_unitario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id_item_pedido")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_cotacao" ADD CONSTRAINT "respostas_cotacao_id_cotacao_fkey" FOREIGN KEY ("id_cotacao") REFERENCES "cotacoes"("id_cotacao") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_cotacao" ADD CONSTRAINT "respostas_cotacao_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "fornecedores"("id_fornecedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cotacao" ADD CONSTRAINT "itens_cotacao_id_cotacao_fkey" FOREIGN KEY ("id_cotacao") REFERENCES "cotacoes"("id_cotacao") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cotacao" ADD CONSTRAINT "itens_cotacao_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "produtos"("id_produto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "produtos"("id_produto") ON DELETE RESTRICT ON UPDATE CASCADE;
