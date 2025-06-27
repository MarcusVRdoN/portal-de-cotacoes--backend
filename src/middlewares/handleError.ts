import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import type { Request } from "@middy/core";
import { logger } from "@/libs";
import { formatErrorResponse } from "@/utils/format";
import type { ApiGatewayMiddlewareObject, LambdaError } from "@/@types";

/**
 * Middleware that logs and returns an error response when an error occurs while processing a middleware.
 *
 * @param {string} [errorMessage="Error to complete handler"] - The error message to be logged and returned.
 * @return {MiddlewareObj} A Middy middleware object.
 */
const handleError = (errorMessage: string = "Error to complete handler"): ApiGatewayMiddlewareObject => ({
  onError: ({ event, error }: Request<APIGatewayProxyEventV2, APIGatewayProxyResultV2, LambdaError>) => {
    logger.error(`🔴 ${errorMessage}`, { event, error });

    return formatErrorResponse((error?.cause || error) as LambdaError);
  },
});

export default handleError;
