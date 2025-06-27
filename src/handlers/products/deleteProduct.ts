import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const deleteProduct = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem deletar produtos");
    }

    const product = await prisma.produto.findUnique({
      where: { id_produto: Number(id) }
    });

    if (!product) {
      throw new NotFound("Produto não encontrado");
    }

    const existingItems = await prisma.itemPedido.findFirst({
      where: { id_produto: Number(id) }
    });

    if (existingItems) {
      logger.warn("🟠 Produto possui itens associados", { data: { product, existingItems } });

      throw new Forbidden("Não é possível deletar produto que possui itens associados");
    }

    await prisma.produto.delete({
      where: { id_produto: Number(id) }
    });

    logger.info("🟢 Produto deletado", { data: { product } });

    return formatResponse({
      message: "Usuário deletado com sucesso!",
      data: product,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao deletar produto", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: deleteProduct });