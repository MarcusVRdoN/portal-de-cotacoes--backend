import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";

const deleteUser = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, user: { id_usuario, tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem deletar usuários");
    }

    if (Number(id) === id_usuario) {
      throw new Forbidden("Não é possível deletar seu próprio usuário");
    }

    const user = await prisma.usuario.findUnique({
      where: { id_usuario: Number(id) },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        tipo_usuario: true
      }
    });

    if (!user) {
      throw new NotFound("Usuário não encontrado");
    }

    const [quotes, orders] = await Promise.all([
      prisma.cotacao.count({ where: { id_cliente: Number(id) } }),
      prisma.pedido.count({ where: { id_cliente: Number(id) } })
    ]);

    if (quotes > 0 || orders > 0) {
      logger.warn("🟠 Usuário possui cotações ou pedidos associados", { data: { user, quotes, orders } });

      throw new Forbidden("Não é possível deletar usuário que possui cotações ou pedidos associados");
    }

    await prisma.usuario.delete({
      where: { id_usuario: Number(id) }
    });

    logger.info("🟢 Usuário deletado", { data: { user } });

    return formatResponse({
      message: "Usuário deletado com sucesso!",
      data: user,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao buscar usuário", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: deleteUser });