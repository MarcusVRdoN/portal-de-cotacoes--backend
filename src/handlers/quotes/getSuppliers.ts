import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import type { LambdaError } from "@/@types";

const getSuppliers = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    // const { user: { tipo_usuario } } = formatEvent(event);

    const suppliers = await prisma.fornecedor.findMany({
      orderBy: { nome: 'asc' }
    });

    logger.info("🟢 Fornecedores encontrados", { data: { suppliers } });

    return formatResponse({
      message: "Fornecedores encontrados com sucesso!",
      data: suppliers,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar fornecedores", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getSuppliers });