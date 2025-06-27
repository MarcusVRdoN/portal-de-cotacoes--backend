import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { StatusCotacao } from "@/libs/prisma";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound, ValidationError } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { QuoteStatus, UserType, type LambdaError } from "@/@types";

const updateQuoteStatus = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, status, user: { id_usuario, tipo_usuario } } = formatEvent(event);

    const validStatus = Object.values(QuoteStatus);

    if (!validStatus.includes(String(status).toUpperCase() as QuoteStatus)) {
      throw new ValidationError(`Status inválido, deve ser um dos seguintes: ${validStatus.join(", ")}`);
    }

    const quote = await prisma.cotacao.findUnique({
      where: { id_cotacao: Number(id) }
    });

    if (!quote) {
      throw new NotFound("Cotação não encontrado");
    }

    if (tipo_usuario !== UserType.ADMIN && quote.id_cliente !== id_usuario) {
      throw new Forbidden("Cotação não pertence ao usuário logado");
    }

    const updatedQuote = await prisma.cotacao.update({
      where: { id_cotacao: Number(id) },
      data: { status: String(status).toUpperCase() as StatusCotacao },
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
      }
    });

    logger.info("🟢 Cotação atualizada", { data: { updatedQuote } });

    return formatResponse({
      message: "Cotação atualizada com sucesso!",
      data: updatedQuote,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao atualizar cotação", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: updateQuoteStatus });