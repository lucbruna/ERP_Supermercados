import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ElasticsearchTransport } from './elasticsearch.transport';
import { context, trace } from '@opentelemetry/api';
import os from 'os';

export { ElasticsearchTransport } from './elasticsearch.transport';
export { LoggingInterceptor } from './nestjs/logging.interceptor';
export { CrmLoggerService } from './nestjs/logger.service';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

export interface LoggerOptions {
  serviceName: string;
  level?: string;
  elasticsearch?: {
    indexPrefix?: string;
    node?: string;
    bufferSize?: number;
    flushInterval?: number;
    circuitBreakerDuration?: number;
  };
}

export interface Logger {
  error: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  http: (message: string, meta?: Record<string, unknown>) => void;
  verbose: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
  silly: (message: string, meta?: Record<string, unknown>) => void;
  child: (options: Record<string, unknown>) => Logger;
}

export interface PrismaQueryLogEntry {
  query: string;
  params: string;
  duration: number;
  timestamp: Date;
}

export interface RequestQueryMetrics {
  count: number;
  totalDurationMs: number;
  slowQueries: PrismaQueryLogEntry[];
  reset: () => void;
}

export function createRequestQueryMetrics(): RequestQueryMetrics {
  const metrics: RequestQueryMetrics = {
    count: 0,
    totalDurationMs: 0,
    slowQueries: [],
    reset() {
      this.count = 0;
      this.totalDurationMs = 0;
      this.slowQueries = [];
    },
  };
  return metrics;
}

export function createPrismaQueryLogger(
  logger: Logger,
  slowThresholdMs: number = 100,
): {
  onQuery: (e: PrismaQueryLogEntry) => void;
  metrics: RequestQueryMetrics;
} {
  const metrics = createRequestQueryMetrics();

  const onQuery = (e: PrismaQueryLogEntry) => {
    metrics.count++;
    metrics.totalDurationMs += e.duration;

    if (e.duration >= slowThresholdMs) {
      metrics.slowQueries.push(e);
      logger.warn(`Slow query detected (${e.duration.toFixed(2)}ms)`, {
        query: e.query.substring(0, 300),
        duration: e.duration,
        params: e.params?.substring(0, 200),
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Query (${e.duration.toFixed(2)}ms): ${e.query.substring(0, 150)}`);
    }
  };

  return { onQuery, metrics };
}

function getCorrelationId(): string {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    return spanContext.traceId;
  }
  return '';
}

const consoleFormat = printf(({ timestamp, level, message, serviceName, correlationId, requestId, ...meta }) => {
  const base = `${timestamp} [${serviceName}] ${level.toUpperCase()}: ${message}`;
  const parts: string[] = [];
  if (correlationId) parts.push(`correlationId=${correlationId}`);
  if (requestId) parts.push(`requestId=${requestId}`);
  if (meta.stack) parts.push(`\n${meta.stack}`);
  const extras = Object.entries(meta)
    .filter(([key]) => !['context', 'stack', 'metadata'].includes(key))
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
  if (extras.length > 0) parts.push(extras.join(' '));
  return parts.length > 0 ? `${base} [${parts.join(', ')}]` : base;
});

export function createLogger(options: LoggerOptions): Logger {
  const { serviceName, level = process.env.LOG_LEVEL || 'info', elasticsearch: esOptions } = options;

  const baseMeta = {
    serviceName,
    environment: process.env.NODE_ENV || 'development',
    hostname: os.hostname(),
    pid: process.pid,
  };

  const transports: winston.transport[] = [];

  const isDev = process.env.NODE_ENV !== 'production';

  transports.push(
    new winston.transports.Console({
      level,
      format: isDev
        ? combine(
            errors({ stack: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            colorize(),
            consoleFormat,
          )
        : combine(
            errors({ stack: true }),
            timestamp(),
            json(),
            winston.format((info) => ({ ...info, ...baseMeta }))(),
          ),
    }),
  );

  if (process.env.LOG_FILE_ENABLED !== 'false') {
    transports.push(
      new DailyRotateFile({
        level,
        filename: `logs/${serviceName}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: combine(errors({ stack: true }), timestamp(), json()),
      }),
    );
  }

  if (esOptions || process.env.ELASTICSEARCH_NODE) {
    const esTransport = new ElasticsearchTransport({
      indexPrefix: esOptions?.indexPrefix || 'crm-logs',
      node: esOptions?.node || process.env.ELASTICSEARCH_NODE,
      level,
      bufferSize: esOptions?.bufferSize || 100,
      flushInterval: esOptions?.flushInterval || 5000,
      circuitBreakerDuration: esOptions?.circuitBreakerDuration || 30000,
    });
    transports.push(esTransport);
  }

  const winstonLogger = winston.createLogger({
    level,
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      verbose: 4,
      debug: 5,
      silly: 6,
    },
    defaultMeta: baseMeta,
    transports,
    exitOnError: false,
  });

  function buildMeta(meta?: Record<string, unknown>): Record<string, unknown> {
    const correlationId = getCorrelationId();
    return {
      ...baseMeta,
      ...(meta || {}),
      ...(correlationId ? { correlationId } : {}),
    };
  }

  const logger: Logger = {
    error: (message, meta) => winstonLogger.error(message, buildMeta(meta)),
    warn: (message, meta) => winstonLogger.warn(message, buildMeta(meta)),
    info: (message, meta) => winstonLogger.info(message, buildMeta(meta)),
    http: (message, meta) => winstonLogger.log('http', message, buildMeta(meta)),
    verbose: (message, meta) => winstonLogger.verbose(message, buildMeta(meta)),
    debug: (message, meta) => winstonLogger.debug(message, buildMeta(meta)),
    silly: (message, meta) => winstonLogger.log('silly', message, buildMeta(meta)),
    child: (childOptions) => {
      const childLogger = winstonLogger.child(childOptions);
      return {
        ...logger,
        info: (message, meta) => childLogger.info(message, { ...childOptions, ...buildMeta(meta) }),
        error: (message, meta) => childLogger.error(message, { ...childOptions, ...buildMeta(meta) }),
        warn: (message, meta) => childLogger.warn(message, { ...childOptions, ...buildMeta(meta) }),
        http: (message, meta) => childLogger.log('http', message, { ...childOptions, ...buildMeta(meta) }),
        verbose: (message, meta) => childLogger.verbose(message, { ...childOptions, ...buildMeta(meta) }),
        debug: (message, meta) => childLogger.debug(message, { ...childOptions, ...buildMeta(meta) }),
        silly: (message, meta) => childLogger.log('silly', message, { ...childOptions, ...buildMeta(meta) }),
        child: (newOptions) => logger.child({ ...childOptions, ...newOptions }),
      };
    },
  };

  return logger;
}
