import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, MissingField, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const updateOrder = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, valor_total, user: { id_usuario, tipo_usuario } } = formatEvent(event);

    const order = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) }
    });

    if (!order) {
      throw new NotFound("Pedido não encontrado");
    }

    if (tipo_usuario !== UserType.ADMIN && order.id_cliente !== id_usuario) {
      throw new Forbidden("Pedido não pertence ao usuário logado");
    }

    if (valor_total === undefined) {
      throw new MissingField("Parâmetro `valor_total` é obrigatório");
    }

    const updatedOrder = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: {
        valor_total: Number(valor_total)
      },
      include: {
        cliente: {
          select: { nome: true, email: true }
        },
        itens: {
          include: {
            produto: true
          }
        }
      }
    });

    logger.info("🟢 Pedido atualizado", { data: { updatedOrder } });

    return formatResponse({
      message: "Pedido atualizado com sucesso!",
      data: updatedOrder,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao atualizar pedido", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: updateOrder });