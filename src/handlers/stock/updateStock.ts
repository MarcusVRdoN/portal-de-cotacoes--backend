import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { StockOperation, UserType, type LambdaError } from "@/@types";

const updateStock = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, quantity, operation = StockOperation.SET, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem atualizar estoque de produtos");
    }

    const product = await prisma.produto.findUnique({
      where: { id_produto: Number(id) }
    });

    if (!product) {
      throw new NotFound("Produto não encontrado");
    }

    const quantityToSet = {
      [StockOperation.SET]: Number(quantity),
      [StockOperation.ADD]: product.estoque + Number(quantity),
      [StockOperation.SUBTRACT]: Math.max(0, product.estoque - Number(quantity)),
    };
    const newQuantity = quantityToSet[String(operation).toLowerCase() as StockOperation];

    const updatedProduct = await prisma.produto.update({
      where: { id_produto: Number(id) },
      data: { estoque: newQuantity }
    });

    const data = {
      product: updatedProduct,
      operation: {
        type: operation,
        stockBefore: product.estoque,
        currentStock: newQuantity,
        difference: newQuantity - product.estoque
      }
    }

    logger.info("🟢 Estoque do produto atualizado", { data });

    return formatResponse({
      message: "Estoque do produto atualizado com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao atualizar estoque do produto", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: updateStock });