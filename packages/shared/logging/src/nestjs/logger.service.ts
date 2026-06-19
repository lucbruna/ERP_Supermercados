import { LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger, createLogger, LoggerOptions } from '../index';

export class CrmLoggerService implements NestLoggerService {
  private logger: Logger;

  constructor(serviceName: string) {
    const options: LoggerOptions = {
      serviceName,
      elasticsearch: {
        indexPrefix: 'crm-logs',
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        bufferSize: 100,
        flushInterval: 5000,
        circuitBreakerDuration: 30000,
      },
    };
    this.logger = createLogger(options);
  }

  log(message: string, ...optionalParams: unknown[]): void {
    this.logger.info(message, { context: optionalParams[0] });
  }

  error(message: string, ...optionalParams: unknown[]): void {
    const [trace, context] = optionalParams;
    this.logger.error(message, {
      stack: trace,
      context: context || trace,
    });
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    this.logger.warn(message, { context: optionalParams[0] });
  }

  debug(message: string, ...optionalParams: unknown[]): void {
    this.logger.debug(message, { context: optionalParams[0] });
  }

  verbose(message: string, ...optionalParams: unknown[]): void {
    this.logger.verbose(message, { context: optionalParams[0] });
  }
}
