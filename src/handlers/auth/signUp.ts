import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { logger, prisma } from "@/libs";
import { Conflict } from "@/utils/errors";
import { formatErrorResponse, formatEvent, formatResponse } from "@/utils/format";
import { hashPassword } from "@/utils/password";
import { UserType, type LambdaError } from "@/@types";

const signUp = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  logger.logEventIfEnabled(event);

  try {
    const { name, email, password, userType } = formatEvent(event);
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Conflict("E-mail já cadastrado");
    }

    const user = await prisma.usuario.create({
      data: {
        nome: name,
        email,
        senha: hashPassword(password),
        tipo_usuario: userType || UserType.CLIENT
      },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        tipo_usuario: true
      }
    });

    logger.info("🟢 Usuário criado", { data: { user } });

    return formatResponse({
      message: "Usuário criado com sucesso!",
      data: user,
    });
  } catch (error: unknown) {
    logger.error("🔴 Falha ao criar usuário", { error, event });

    return formatErrorResponse(error as LambdaError);
  }
};

export default signUp;