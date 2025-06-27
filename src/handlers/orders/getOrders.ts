import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";
import { isEmpty } from "@/utils/helpers";

const getOrders = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { page = 1, limit = 10, cliente_id, user: { id_usuario, tipo_usuario } } = formatEvent(event);
    const where: any = {};

    if (tipo_usuario === UserType.CLIENT) {
      where.id_cliente = id_usuario;
    } else if (tipo_usuario === UserType.ADMIN && cliente_id) {
      where.id_cliente = Number(cliente_id);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
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
        orderBy: { data_pedido: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.pedido.count({ where })
    ]);

    if (isEmpty(orders) || total === 0) {
      throw new NotFound("Nenhum pedido encontrado!");
    }

    const data = {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }

    logger.info("🟢 Pedidos encontrados", { data });

    return formatResponse({
      message: "Pedidos encontrados com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar pedidos", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getOrders });