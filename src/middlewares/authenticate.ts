import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import type { Request } from "@middy/core";
import jwt from "jsonwebtoken";
import { Unauthorized } from "@/utils/errors";
import type { ApiGatewayMiddlewareObject, JsonWebTokenPayload, LambdaError } from "@/@types";

/**
 * Middleware that authenticates requests by validating the API key.
 *
 * @return {ApiGatewayMiddlewareObject} An object with a 'before' hook that executes the API key validation middleware.
 *
 * @example
 * authenticate(); // { before: [Function: validateApiKeyMiddleware] }
 */
const authenticate = (): ApiGatewayMiddlewareObject => ({
  before: async (request: Request<APIGatewayProxyEventV2, APIGatewayProxyResultV2, LambdaError>) => {
    const { event } = request;
    const authHeader = event.headers.authorization ?? event.headers.Authorization;

    if (!authHeader) {
      throw new Unauthorized("Token de autenticação não fornecido");
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw new Unauthorized("Cabeçalho de autorização mal formatado. Use 'Bearer <token>'");
    }

    const JsonWebTokenSecret = String(process.env.JWT_SECRET);

    if (!JsonWebTokenSecret) {
      throw new Unauthorized("Segredo JWT não configurado.");
    }

    let decoded: JsonWebTokenPayload;

    try {
      decoded = jwt.verify(token, JsonWebTokenSecret) as JsonWebTokenPayload;
    } catch (error) {
      throw new Unauthorized("Token inválido");
    }

    (event as any).user = decoded;
  },
});

export default authenticate;