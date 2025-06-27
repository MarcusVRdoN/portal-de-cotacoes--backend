import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { MissingField } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { isArrayLike, isEmpty } from "@/utils/helpers";
import { QuoteStatus, type LambdaError } from "@/@types";

const createQuote = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { items = [], user: { id_usuario } } = formatEvent(event);

    if (isEmpty(items) || !isArrayLike(items)) {
      throw new MissingField("Itens da cotação são obrigatórios");
    }

    for (const item of items) {
      if (!item.id_produto || !item.quantidade) {
        throw new MissingField("Cada item deve ter `id_produto` e `quantidade`");
      }
    }

    const quote = await prisma.cotacao.create({
      data: {
        id_cliente: id_usuario,
        status: QuoteStatus.PENDING,
        data_solicitacao: new Date(),
        itensCotacao: {
          createMany: {
            data: items.map((item: any) => ({
              id_produto: item.id_produto,
              quantidade: item.quantidade,
            })),
          },
        },
      },
      include: {
        cliente: {
          select: { nome: true, email: true },
        },
        itensCotacao: {
          include: {
            produto: {
              select: { nome_produto: true, descricao: true },
            },
          },
        },
      },
    });

    logger.info("🟢 Cotação criada", { data: { quote } });

    return formatResponse({
      statusCode: 201,
      message: "Cotação criada com sucesso!",
      data: quote,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao criar cotação", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: createQuote });