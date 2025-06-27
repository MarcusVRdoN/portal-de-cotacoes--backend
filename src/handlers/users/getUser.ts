import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const getUser = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem buscar usuários");
    }

    const user = await prisma.usuario.findUnique({
      where: { id_usuario: Number(id) },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        tipo_usuario: true
      }
    });

    if (!user) {
      throw new NotFound("Usuário não encontrado");
    }

    const [quotes, orders] = await Promise.all([
      prisma.cotacao.count({
        where: { id_cliente: Number(id) }
      }),
      prisma.pedido.aggregate({
        where: { id_cliente: Number(id) },
        _count: true,
        _sum: { valor_total: true }
      })
    ]);

    const data = {
      user,
      statistics: {
        totalQuotes: quotes,
        totalOrders: orders._count,
        totalOrdersValue: orders._sum.valor_total || 0
      }
    }

    logger.info("🟢 Usuário encontrado", { data });

    return formatResponse({
      message: "Usuário encontrado com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar usuário", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getUser });