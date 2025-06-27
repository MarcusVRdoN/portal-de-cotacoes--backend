import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import jwt from "jsonwebtoken";
import { logger, prisma } from "@/libs";
import { Unauthorized } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { verifyPassword } from "@/utils/password";
import { type LambdaError } from "@/@types";

const signIn = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { email, password } = formatEvent(event);
    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Unauthorized("Email ou senha inválidos");
    }

    const validPassword = verifyPassword(password, user.senha);

    if (!validPassword) {
      throw new Unauthorized("Email ou senha inválidos");
    }

    const userData = {
      id_usuario: user.id_usuario,
      email: user.email,
      tipo_usuario: user.tipo_usuario
    }
    const token = jwt.sign(userData, String(process.env.JWT_SECRET), { expiresIn: '24h' });

    logger.info("🟢 Login realizado", { data: { token, user } });

    return formatResponse({
      message: "Login realizado com sucesso!",
      data: {
        token,
        user: {
          id_usuario: user.id_usuario,
          nome: user.nome,
          email: user.email,
          tipo_usuario: user.tipo_usuario
        }
      },
    });
  } catch (error: unknown) {
    logger.error("🔴 Erro ao logar usuário", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
}

export default signIn;