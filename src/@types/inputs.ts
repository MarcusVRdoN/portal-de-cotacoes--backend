export interface formatResponseInput {
  statusCode?: number;
  message?: string;
  data?: object;
  headers?: Record<string, string>;
  isBase64Encoded?: boolean;
  [key: string]: unknown;
}