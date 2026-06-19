import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ApiKeysService } from './api-keys.service';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    const keyData = await this.apiKeysService.validateKey(apiKey);

    if (!keyData) {
      this.logger.warn(`Invalid API key attempt from ${request.ip}`);
      throw new UnauthorizedException('Invalid or expired API key');
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPermissions && requiredPermissions.length > 0) {
      const keyPermissions = keyData.permissions.split(',').map((p) => p.trim());
      const hasPermission = requiredPermissions.some((p) =>
        keyPermissions.includes(p) || keyPermissions.includes('admin'),
      );
      if (!hasPermission) {
        throw new UnauthorizedException('Insufficient API key permissions');
      }
    }

    (request as any).apiKey = keyData;
    return true;
  }
}
