import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { MissingField, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import type { LambdaError } from "@/@types";

const getUserProfile = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { user: { id_usuario } } = formatEvent(event);

    if (!id_usuario) {
      throw new MissingField("Parâmetro `id_usuario` é obrigatório");
    }

    const user = await prisma.usuario.findUnique({
      where: { id_usuario: Number(id_usuario) },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        tipo_usuario: true,
      },
    });

    if (!user) {
      throw new NotFound("Usuário não encontrado");
    }

    logger.info("🟢 Perfil do usuário encontrado", { data: { user } });

    return formatResponse({
      message: "Perfil do usuário encontrado com sucesso!",
      data: user,
    });
  } catch (error: unknown) {
    logger.error("🔴 Falha ao localizar perfil do usuário", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: getUserProfile });