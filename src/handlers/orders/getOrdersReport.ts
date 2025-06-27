import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const getOrdersReport = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { dateStart, dateEnd, clientId, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem buscar relatórios de pedidos");
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

    const [orders, statistics] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: {
          cliente: {
            select: { nome: true, email: true }
          },
          itens: {
            include: {
              produto: {
                select: { nome_produto: true }
              }
            }
          }
        },
        orderBy: { data_pedido: 'desc' }
      }),
      prisma.pedido.aggregate({
        where,
        _sum: { valor_total: true },
        _count: true,
        _avg: { valor_total: true }
      })
    ]);

    const data = {
      orders,
      statistics: {
        total: statistics._count,
        totalValue: statistics._sum.valor_total || 0,
        averageValue: statistics._avg.valor_total || 0
      }
    }

    logger.info("🟢 Relatório de pedidos gerado", { data });

    return formatResponse({
      message: "Relatório de pedidos gerado com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao gerar relatório de pedidos", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getOrdersReport });