import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, MissingField } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const createProduct = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { productName, description, quantity = 0, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem criar produtos");
    }

    if (!productName || !description) {
      throw new MissingField("Nome e descrição do produto são obrigatórios");
    }

    const product = await prisma.produto.create({
      data: {
        nome_produto: productName,
        descricao: description,
        estoque: Number(quantity),
      }
    });

    logger.info("🟢 Produto criado", { data: { product } });

    return formatResponse({
      statusCode: 201,
      message: "Produto criado com sucesso!",
      data: product,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao criar produto", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: createProduct });