import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const correlationId = (request.headers['x-correlation-id'] as string) || uuidv4();
    const requestId = uuidv4();

    request.headers['x-correlation-id'] = correlationId;
    request.headers['x-request-id'] = requestId;
    response.setHeader('x-correlation-id', correlationId);
    response.setHeader('x-request-id', requestId);

    const { method, url } = request;
    const userAgent = request.headers['user-agent'] || '';
    const ip = request.ip || request.socket.remoteAddress || '';
    const startTime = Date.now();

    this.logger.log({
      message: `Incoming ${method} ${url}`,
      correlationId,
      requestId,
      method,
      url,
      ip,
      userAgent,
      context: 'HTTP',
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log({
          message: `Response ${method} ${url} ${statusCode} ${duration}ms`,
          correlationId,
          requestId,
          method,
          url,
          statusCode,
          duration,
          context: 'HTTP',
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || error.statusCode || 500;

        this.logger.error({
          message: `Error ${method} ${url} ${statusCode} - ${error.message}`,
          correlationId,
          requestId,
          method,
          url,
          statusCode,
          duration,
          stack: error.stack,
          errorName: error.name,
          context: 'HTTP',
        });

        throw error;
      }),
    );
  }
}
