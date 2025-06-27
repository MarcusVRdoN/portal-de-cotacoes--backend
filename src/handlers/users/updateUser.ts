import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Conflict, Forbidden, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { UserType, type LambdaError } from "@/@types";
import { hashPassword } from "@/utils/password";

const updateUser = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { id, name, email, newPassword, userType, user: { tipo_usuario } } = formatEvent(event);

    if (tipo_usuario !== UserType.ADMIN) {
      throw new Forbidden("Apenas administradores podem atualizar usuários");
    }

    const user = await prisma.usuario.findUnique({
      where: { id_usuario: Number(id) }
    });

    if (!user) {
      throw new NotFound("Usuário não encontrado");
    }

    const updateData: any = {};

    if (name) {
      updateData.nome = name;
    }

    if (userType) {
      updateData.tipo_usuario = userType;
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.usuario.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Conflict("Email já está em uso");
      }

      updateData.email = email;
    }

    if (newPassword) {
      updateData.senha = hashPassword(newPassword);
    }

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario: Number(id) },
      data: updateData,
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        tipo_usuario: true
      }
    });

    logger.info("🟢 Usuário atualizado", { data: { updatedUser } });

    return formatResponse({
      message: "Usuário atualizado com sucesso!",
      data: updatedUser,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao atualizar usuário", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: updateUser });