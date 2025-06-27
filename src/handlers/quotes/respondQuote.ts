import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { QuoteStatus, UserType, type LambdaError } from "@/@types";

const respondQuote = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, supplierId, unitPrice, deliveryTime, user: { tipo_usuario } } = formatEvent(event);

    const quote = await prisma.cotacao.findUnique({
      where: { id_cotacao: Number(id) }
    });

    if (!quote) {
      throw new NotFound("Cotação não encontrado");
    }

    if (tipo_usuario !== UserType.SUPPLIER) {
      throw new Forbidden("Apenas fornecedores podem responder cotações");
    }

    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id_fornecedor: Number(supplierId) }
    });

    if (!fornecedor) {
      throw new NotFound("Fornecedor não encontrado");
    }

    const quoteResponse = await prisma.respostaCotacao.create({
      data: {
        id_cotacao: Number(id),
        id_fornecedor: Number(supplierId),
        preco_unitario: Number(unitPrice),
        prazo_entrega: deliveryTime,
      },
      include: {
        fornecedor: true,
        cotacao: {
          include: {
            cliente: {
              select: { nome: true, email: true }
            }
          }
        }
      }
    });

    await prisma.cotacao.update({
      where: { id_cotacao: Number(id) },
      data: { status: QuoteStatus.RESPONDED },
    });

    logger.info("🟢 Cotação respondida", { data: { quoteResponse } });

    return formatResponse({
      statusCode: 201,
      message: "Cotação respondida com sucesso!",
      data: quoteResponse,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao responder cotação", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: respondQuote });