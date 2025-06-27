export interface ErrorData {
  errorType?: string;
  [key: string]: unknown;
}

export interface LambdaError extends Error {
  $metadata?: {
    httpStatusCode?: number;
  };
  statusCode?: number;
  response?: {
    status?: number;
  };
  data?: ErrorData;
}
