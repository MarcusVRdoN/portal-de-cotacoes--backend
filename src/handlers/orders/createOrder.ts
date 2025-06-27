import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { MissingField } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { isArrayLike, isEmpty } from "@/utils/helpers";
import type { LambdaError } from "@/@types";

const createOrder = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { items = [], user: { id_usuario } } = formatEvent(event);

    if (isEmpty(items) || !isArrayLike(items)) {
      throw new MissingField("Itens do pedido são obrigatórios");
    }

    for (const item of items) {
      if (!item.id_produto || !item.quantidade || !item.valor_unitario) {
        throw new MissingField("Cada item deve ter `id_produto`, `quantidade` e `valor_unitario`");
      }
    }

    const totalValue = items.reduce((total: number, item: any) => {
      return total + (item.quantidade * item.valor_unitario);
    }, 0);

    const order = await prisma.pedido.create({
      data: {
        id_cliente: id_usuario,
        valor_total: totalValue,
        data_pedido: new Date(),
        itens: {
          createMany: {
            data: items.map((item: any) => ({
              id_produto: Number(item.id_produto),
              quantidade: Number(item.quantidade),
              valor_unitario: Number(item.valor_unitario)
            }))
          }
        }
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

    logger.info("🟢 Pedido criado", { data: { order } });

    return formatResponse({
      statusCode: 201,
      message: "Pedido criado com sucesso!",
      data: order,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao criar pedido", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: createOrder });