export class LoggingInterceptor {
  intercept(context: any, next: { handle: () => any }) {
    return next.handle();
  }
}

export class CrmLoggerService {
  log = jest.fn();
  error = jest.fn();
  warn = jest.fn();
  debug = jest.fn();
  verbose = jest.fn();
}

export function createLogger(options: any) {
  return new CrmLoggerService();
}

export const logger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

export default logger;