import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const getQuote = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, user: { id_usuario, tipo_usuario } } = formatEvent(event);

    const quote = await prisma.cotacao.findUnique({
      where: { id_cotacao: Number(id) },
      include: {
        cliente: {
          select: { id_usuario: true, nome: true, email: true }
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
      }
    });

    if (!quote) {
      throw new NotFound("Cotação não encontrada");
    }

    if (tipo_usuario !== UserType.ADMIN && quote.id_cliente !== id_usuario) {
      throw new Forbidden("Cotação não pertence ao usuário logado");
    }

    logger.info("🟢 Cotação encontrada", { data: { quote } });

    return formatResponse({
      message: "Cotação encontrada com sucesso!",
      data: quote,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar cotação", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getQuote });