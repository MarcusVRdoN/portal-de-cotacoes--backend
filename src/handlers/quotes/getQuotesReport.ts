import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { QuoteStatus, UserType, type LambdaError } from "@/@types";

const getQuotesReport = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { dateStart, dateEnd, clientId, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem buscar relatórios de cotações");
    }

    const where: any = {};

    if (dateStart && dateEnd) {
      where.data_pedido = {
        gte: new Date(dateStart),
        lte: new Date(dateEnd)
      };
    }

    if (clientId) {
      where.id_cliente = Number(clientId);
    }

    const wherePending = { ...where, status: QuoteStatus.PENDING };
    const whereConfirmed = { ...where, status: QuoteStatus.WON };

    const [statistics, pendingCount, confirmedCount] = await Promise.all([
      prisma.cotacao.aggregate({
        where,
        _count: true,
      }),
      prisma.cotacao.count({
        where: wherePending
      }),
      prisma.cotacao.count({
        where: whereConfirmed
      })
    ]);

    const data = {
      statistics: {
        total: statistics._count,
        pendingCount: pendingCount,
        confirmedCount: confirmedCount,
      }
    }

    logger.info("🟢 Relatório de cotações gerado", { data });

    return formatResponse({
      message: "Relatório de cotações gerado com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao gerar relatório de cotações", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getQuotesReport });