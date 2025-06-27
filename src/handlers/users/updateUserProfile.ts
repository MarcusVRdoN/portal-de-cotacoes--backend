import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { middleware } from "@/middlewares";
import { Conflict, MissingField, NotFound } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import type { LambdaError } from "@/@types";
import { hashPassword, verifyPassword } from "@/utils/password";

const updateUserProfile = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { name, email, password, newPassword, user: { id_usuario } } = formatEvent(event);

    const user = await prisma.usuario.findUnique({
      where: { id_usuario }
    });

    if (!user) {
      throw new NotFound("Usuário não encontrado");
    }

    const updateData: any = {};

    if (name) {
      updateData.nome = name;
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
      if (!password) {
        throw new MissingField("Senha atual é obrigatória para alterar a senha");
      }

      const validPassword = verifyPassword(password, user.senha);

      if (!validPassword) {
        throw new Error("Senha atual incorreta");
      }

      updateData.senha = hashPassword(newPassword);
    }

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario },
      data: updateData,
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        tipo_usuario: true
      }
    });

    logger.info("🟢 Perfil do usuário atualizado", { data: { updatedUser } });

    return formatResponse({
      message: "Perfil do usuário atualizado com sucesso!",
      data: updatedUser,
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao atualizar perfil", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default middleware({ handler: updateUserProfile });