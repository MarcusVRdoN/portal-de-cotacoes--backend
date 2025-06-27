import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";
import { isEmpty } from "@/utils/helpers";

const getUsers = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { page = 1, limit = 10, type, search, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem buscar usuários");
    }

    const where: any = {};

    if (type) {
      where.tipo_usuario = String(type).toUpperCase();
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id_usuario: true,
          nome: true,
          email: true,
          tipo_usuario: true
        },
        orderBy: { nome: 'asc' },
        skip,
        take: Number(limit)
      }),
      prisma.usuario.count({ where })
    ]);

    if (isEmpty(users) || total === 0) {
      throw new NotFound("Nenhum usuário encontrado");
    }

    const data = {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }

    logger.info("🟢 Usuários encontrados", { data });

    return formatResponse({
      message: "Usuários encontrados com sucesso!",
      data,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar usuários", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getUsers });