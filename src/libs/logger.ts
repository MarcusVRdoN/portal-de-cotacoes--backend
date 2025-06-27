import { Logger, LogLevel } from "@aws-lambda-powertools/logger";

const logger = new Logger({
  serviceName: `portal-de-cotacoes`,
  logLevel: LogLevel.INFO,
  sampleRateValue: 1.0,
  logRecordOrder: ["message"],
  persistentLogAttributes: {
    environment: process.env.STAGE,
  }
});

export default logger;
