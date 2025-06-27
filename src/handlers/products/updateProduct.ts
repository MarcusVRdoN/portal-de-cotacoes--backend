import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const updateProduct = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, productName, description, quantity, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem atualizar produtos");
    }

    const product = await prisma.produto.findUnique({
      where: { id_produto: Number(id) }
    });

    if (!product) {
      throw new NotFound("Produto não encontrado");
    }

    const updatedData: any = {};

    if (productName) {
      updatedData.nome_produto = productName;
    }

    if (description) {
      updatedData.descricao = description;
    }

    if (quantity !== undefined) {
      updatedData.estoque = Number(quantity);
    }

    const updatedProduct = await prisma.produto.update({
      where: { id_produto: Number(id) },
      data: updatedData
    });

    logger.info("🟢 Produto atualizado", { data: { updatedProduct } });

    return formatResponse({
      message: "Produto atualizado com sucesso!",
      data: updatedProduct,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao atualizar produto", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: updateProduct });