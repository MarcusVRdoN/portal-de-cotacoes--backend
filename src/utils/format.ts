import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { isEmpty } from "@/utils/helpers";
import { deserialize, parseObjectKey, serialize } from "@/utils/object";
import type { formatResponseInput, LambdaError } from "@/@types";

/**
 * Formats the given APIGatewayProxyEventV2 object.
 *
 * @param {APIGatewayProxyEventV2} event - The event object to be formatted.
 * @return {T} The formatted event object.
 *
 * @example
 * formatEvent({ body: { key: "value" } }); // { key: "value" }
 * formatEvent({ body: "Lorem ipsum dolor sit amet" }); // { body: "Lorem ipsum dolor sit amet" }
 * formatEvent({ body: { key1: "value1" }, pathParameters: { key2: "value2" } }); // { key1: "value1", key2: "value2" }
 * formatEvent({ body: { key1: "value1" }, queryStringParameters: { key2: "value2" } }); // { key1: "value1", key2: "value2" }
 * formatEvent({ requestContext: { key: { key: "value" } } headers: { key: "value" } }); // { key: { key: "value" }, headers: { key: "value" } }
 * formatEvent({ pathParameters: null }); // {}
 * formatEvent({ Records: [{ eventSource: "aws:sqs" }] }); // {}
 * formatEvent({ Records: [{ EventSource: "aws:sns" }] }); // {}
 * formatEvent({}); // {}
 */
export const formatEvent = <T = any>(event: APIGatewayProxyEventV2): T => {
  const { body, pathParameters, queryStringParameters, requestContext, headers } = event;
  const formattedEvent = {
    ...event,
    ...(body ? parseObjectKey(body, "body") : {}),
    ...(pathParameters ? deserialize(pathParameters) : {}),
    ...(queryStringParameters ? deserialize(queryStringParameters) : {}),
    ...(requestContext ? deserialize(requestContext) : {}),
    ...(headers ? { headers: deserialize(headers) } : {}),
  };

  return formattedEvent as T;
};

/**
 * Generates a formatted response object.
 *
 * @param {formatResponseInput} options - An object containing the following properties:
 * @param {number} [options.statusCode=200] - The HTTP status code of the response. Default is 200.
 * @param {string} [options.message=""] - A message to include in the response. Default is an empty string.
 * @param {object} [options.data={}] - Additional data to include in the response. Default is an empty object.
 * @param {Record<string, string>} [options.headers={}] - Additional headers to include in the response. Default is an empty object.
 * @param {boolean} [options.isBase64Encoded=false] - A flag indicating whether the response is base64 encoded. Default is false.
 * @param {any} [options.args] - Additional arguments to include in the response.
 * @return {APIGatewayProxyResultV2} The formatted response object with the specified status code, headers, and body.
 */
export const formatResponse = ({
  statusCode = 200,
  message = "",
  data,
  headers = {},
  isBase64Encoded = false,
  ...args
}: formatResponseInput): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    ...headers,
  },
  isBase64Encoded,
  body: serialize({
    statusCode,
    timestamp: new Date().toISOString(),
    message,
    data,
    ...args,
  }),
});

/**
 * Formats the error status code based on the given error object and a flag indicating whether only metadata error should be considered.
 *
 * @param {LambdaError} error - The error object.
 * @param {boolean} onlyMetadataError - Flag indicating whether only metadata error should be considered. Default is false.
 * @return {number} The formatted error status code.
 */
export const formatErrorStatusCode = (error: LambdaError, onlyMetadataError: boolean = false): number => {
  const statusCode = onlyMetadataError
    ? error?.$metadata?.httpStatusCode
    : error.statusCode || error?.$metadata?.httpStatusCode || error.response?.status;

  return statusCode || 400;
};

/**
 * Formats an error response with the given error, message, and data.
 *
 * @param {LambdaError} error - The error object.
 * @param {string} message - The error message.
 * @param {object} data - Additional data to include in the response.
 * @return {APIGatewayProxyResultV2} The formatted error response.
 */
export const formatErrorResponse = (
  error: LambdaError | Error,
  message = "",
  data = {},
): APIGatewayProxyResultV2 => {
  const statusCode = formatErrorStatusCode(error);

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    isBase64Encoded: false,
    body: serialize({
      message: message || error.message || error.name || "Unknown error",
      data: isEmpty(data) ? (error as LambdaError).data : data,
    }),
  };
};