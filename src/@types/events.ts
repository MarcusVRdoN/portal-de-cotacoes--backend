import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { MiddlewareObj } from "@middy/core";
import type { LambdaError } from "@/@types";

export interface MiddlewareParams {
  handler: APIGatewayProxyHandlerV2;
  errorMessage?: string;
}

export interface ApiGatewayMiddlewareObject<T = APIGatewayProxyEventV2, R = APIGatewayProxyResultV2, E = LambdaError> extends MiddlewareObj<T, R, E> { }

export interface JsonWebTokenPayload {
  id_usuario: number;
  email: string;
  tipo_usuario: string;
}