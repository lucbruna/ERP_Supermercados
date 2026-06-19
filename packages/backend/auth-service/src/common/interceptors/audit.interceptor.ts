import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma.service';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path, ip } = request;
    const user = (request as any).user;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          if (user && this.shouldAudit(method, path)) {
            const duration = Date.now() - startTime;
            this.prisma.auditLog.create({
              data: {
                companyId: user.companyId,
                userId: user.id,
                userNome: user.nome,
                acao: method,
                recurso: path,
                ip: ip || '0.0.0.0',
                userAgent: request.headers['user-agent'] || '',
                detalhes: `Duration: ${duration}ms`,
                gravidade: 'BAIXA',
              },
            }).catch((err) => this.logger.error('Audit log failed', err));
          }
        },
        error: (error) => {
          if (user) {
            this.prisma.auditLog.create({
              data: {
                companyId: user.companyId,
                userId: user.id,
                userNome: user.nome,
                acao: `${method}_ERROR`,
                recurso: path,
                ip: ip || '0.0.0.0',
                userAgent: request.headers['user-agent'] || '',
                detalhes: error.message,
                gravidade: error.status >= 500 ? 'CRITICA' : 'MEDIA',
              },
            }).catch((err) => this.logger.error('Audit log failed', err));
          }
        },
      }),
    );
  }

  private shouldAudit(method: string, path: string): boolean {
    const excluded = ['/health', '/metrics', '/api/docs'];
    if (excluded.some((e) => path.includes(e))) return false;
    if (method === 'GET' && path.includes('/auth/me')) return false;
    return true;
  }
}
