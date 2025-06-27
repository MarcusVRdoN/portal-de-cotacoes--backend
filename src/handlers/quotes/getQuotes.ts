import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";
import { isEmpty } from "@/utils/helpers";

const getQuotes = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { page = 1, limit = 10, status, user: { id_usuario, tipo_usuario } } = formatEvent(event);

    const where: any = {};

    if (tipo_usuario === UserType.CLIENT) {
      where.id_cliente = id_usuario;
    }

    if (status) {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [quotes, total] = await Promise.all([
      prisma.cotacao.findMany({
        where,
        include: {
          cliente: {
            select: { nome: true, email: true }
          },
          respostas: {
            include: {
              fornecedor: true
            }
          },
          itensCotacao: {
            include: {
              produto: {
                select: { nome_produto: true }
              }
            }
          }
        },
        orderBy: { data_solicitacao: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.cotacao.count({ where })
    ]);

    if (isEmpty(quotes) || total === 0) {
      throw new NotFound("Nenhuma cotação encontrada");
    }

    const data = {
      quotes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }

    logger.info("🟢 Cotações encontradas", { data });

    return formatResponse({
      message: "Cotações encontradas com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar cotações", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getQuotes });