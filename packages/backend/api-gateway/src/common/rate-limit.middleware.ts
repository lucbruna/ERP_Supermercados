import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor() {
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime <= now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const key = this.getClientKey(req);
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.store.set(key, entry);
    } else {
      entry.count++;
    }

    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${key}`);
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    next();
  }

  private getClientKey(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
