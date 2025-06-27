import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const getLowStockReport = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { quantity = 50, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem atualizar gerar relatório de estoque baixo");
    }

    const productsWithLowStock = await prisma.produto.findMany({
      where: {
        estoque: {
          lte: Number(quantity)
        }
      },
      orderBy: { estoque: 'asc' }
    });

    const data = {
      products: productsWithLowStock,
      totalProductsWithLowStock: productsWithLowStock.length,
      minimumStock: Number(quantity)
    };

    logger.info("🟢 Relatório de estoque baixo gerado", { data });

    return formatResponse({
      message: "Relatório de estoque baixo gerado com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao gerar relatório de estoque baixo", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getLowStockReport });