import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const getProduct = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id } = formatEvent(event);

    const product = await prisma.produto.findUnique({
      where: { id_produto: Number(id) }
    });

    if (!product) {
      throw new NotFound("Produto não encontrado");
    }

    logger.info("🟢 Produto encontrado", { data: { product } });

    return formatResponse({
      message: "Produto encontrado com sucesso!",
      data: product,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar produto", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getProduct });