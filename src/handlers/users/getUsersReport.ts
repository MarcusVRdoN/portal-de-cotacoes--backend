import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const getOrdersReport = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem buscar relatórios de usuários");
    }

    const [statistics, usersPerType] = await Promise.all([
      prisma.usuario.aggregate({ _count: true }),
      prisma.usuario.groupBy({ by: ['tipo_usuario'], _count: true })
    ]);

    const data = {
      total: statistics._count,
      usersPerType: usersPerType.reduce((type, user) => {
        type[user.tipo_usuario] = user._count;
        return type;
      }, {} as Record<string, number>)
    }

    logger.info("🟢 Relatório de usuários gerado", { data });

    return formatResponse({
      message: "Relatório de usuários gerado com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao gerar relatório de usuários", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getOrdersReport });