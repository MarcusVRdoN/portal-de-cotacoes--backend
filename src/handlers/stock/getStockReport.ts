import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const getStockReport = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { quantity = 50, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem atualizar gerar relatório de estoque");
    }

    const [statistics, productsWithoutStock, productsWithLowStock] = await Promise.all([
      prisma.produto.aggregate({
        _count: true,
        _sum: { estoque: true },
        _avg: { estoque: true }
      }),
      prisma.produto.count({
        where: { estoque: 0 }
      }),
      prisma.produto.count({
        where: {
          estoque: { gt: 0, lte: Number(quantity) }
        }
      })
    ]);

    const productsBestSeller = await prisma.itemPedido.groupBy({
      by: ['id_produto'],
      _sum: { quantidade: true },
      _count: true,
      orderBy: {
        _sum: { quantidade: 'desc' }
      },
      take: 10
    });

    const productsBestSellerDetails = await Promise.all(
      productsBestSeller.map(async (item) => {
        const product = await prisma.produto.findUnique({
          where: { id_produto: item.id_produto }
        });

        return {
          product,
          quantitySold: item._sum.quantidade,
          ordersCount: item._count
        };
      })
    );

    const data = {
      statistics: {
        totalProducts: statistics._count,
        totalStockItems: statistics._sum.estoque || 0,
        stockAverage: statistics._avg.estoque || 0,
        productsWithoutStock,
        productsWithLowStock,
      },
      productsBestSeller: productsBestSellerDetails
    }

    logger.info("🟢 Relatório de estoque gerado", { data });

    return formatResponse({
      message: "Relatório de estoque gerado com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao gerar relatório de estoque", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getStockReport });