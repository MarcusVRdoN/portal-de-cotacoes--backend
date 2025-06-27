import middy, { MiddyfiedHandler } from "@middy/core";
import authenticate from "./authenticate";
import handleError from "./handleError";
import type { MiddlewareParams } from "@/@types";

export const middleware = ({ handler, errorMessage }: MiddlewareParams): MiddyfiedHandler => {
  return middy(handler).use(authenticate()).use(handleError(errorMessage));
}
