import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";
import { isEmpty } from "@/utils/helpers";

const getProducts = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { page = 1, limit = 10, search, user: { tipo_usuario } } = formatEvent(event);

    const where: any = {};

    if (search) {
      where.OR = [
        { nome_produto: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        orderBy: { nome_produto: 'asc' },
        skip,
        take: Number(limit)
      }),
      prisma.produto.count({ where })
    ]);

    if (isEmpty(products) || total === 0) {
      throw new NotFound("Nenhum produto encontrado");
    }

    const data = {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }

    logger.info("🟢 Produtos encontrados", { data });

    return formatResponse({
      message: "Produtos encontrados com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar produtos", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};
export default middleware({ handler: getProducts });