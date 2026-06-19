import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RateLimitService } from './rate-limit.service';

export interface ThrottleOptions {
  limit?: number;
  window?: number;
}

export const THROTTLE_KEY = 'throttle';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const throttleOptions = this.reflector.getAllAndOverride<ThrottleOptions>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    let tier: string;
    let key: string;
    let windowMs: number;
    let maxReq: number;

    const apiKey = (request as any).apiKey;
    const user = (request as any).user;

    if (apiKey) {
      tier = `api-key:${apiKey.tier || 'standard'}`;
      key = `apikey:${apiKey.id}`;
      const config = this.rateLimitService.getLimitConfig(tier);
      windowMs = throttleOptions?.window || config.window;
      maxReq = throttleOptions?.limit || config.max;
    } else if (user) {
      tier = 'user:jwt';
      key = `user:${user.id || user.sub}`;
      const config = this.rateLimitService.getLimitConfig(tier);
      windowMs = throttleOptions?.window || config.window;
      maxReq = throttleOptions?.limit || config.max;
    } else {
      tier = 'ip';
      key = request.ip || request.socket.remoteAddress || 'unknown';
      const config = this.rateLimitService.getLimitConfig(tier);
      windowMs = throttleOptions?.window || config.window;
      maxReq = throttleOptions?.limit || config.max;
    }

    const result = await this.rateLimitService.checkRateLimit(key, tier, windowMs, maxReq);

    response.setHeader('X-RateLimit-Limit', result.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

    if (!result.allowed) {
      response.setHeader('Retry-After', result.retryAfter);

      this.logger.warn(`Rate limit exceeded for ${tier}:${key}`);

      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests, please try again later.',
        retryAfter: result.retryAfter,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
