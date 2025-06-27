import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const getOrder = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, user: { id_usuario, tipo_usuario } } = formatEvent(event);

    const order = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      include: {
        cliente: {
          select: { id_usuario: true, nome: true, email: true }
        },
        itens: {
          include: {
            produto: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFound("Pedido não encontrado");
    }

    if (tipo_usuario !== UserType.ADMIN && order.id_cliente !== id_usuario) {
      throw new Forbidden("Pedido não pertence ao usuário logado");
    }

    logger.info("🟢 Pedido encontrado", { data: { order } });

    return formatResponse({
      message: "Pedido encontrado com sucesso!",
      data: order,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar pedido", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getOrder });