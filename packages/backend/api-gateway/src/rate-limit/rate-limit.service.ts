import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis.service';

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  private readonly limits: Record<string, { window: number; max: number }> = {
    ip: { window: 60000, max: 100 },
    'api-key:standard': { window: 60000, max: 1000 },
    'api-key:premium': { window: 60000, max: 10000 },
    'user:jwt': { window: 60000, max: 200 },
  };

  constructor(private readonly redis: RedisService) {}

  async checkRateLimit(
    key: string,
    tier: string = 'ip',
    windowMs?: number,
    maxRequests?: number,
  ): Promise<RateLimitResult> {
    const config = this.limits[tier] || this.limits.ip;
    const window = windowMs || config.window;
    const max = maxRequests || config.max;

    const now = Date.now();
    const redisKey = `ratelimit:${tier}:${key}`;
    const windowKey = `${redisKey}:${Math.floor(now / window)}`;

    try {
      const current = await this.redis.get(windowKey);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= max) {
        const resetTime = (Math.floor(now / window) + 1) * window;
        return {
          allowed: false,
          limit: max,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime - now) / 1000),
        };
      }

      await this.redis.set(windowKey, (count + 1).toString(), Math.ceil(window / 1000));

      const resetTime = (Math.floor(now / window) + 1) * window;
      return {
        allowed: true,
        limit: max,
        remaining: max - count - 1,
        resetTime,
        retryAfter: 0,
      };
    } catch (error) {
      this.logger.error(`Rate limit check error: ${error.message}`);
      return {
        allowed: true,
        limit: max,
        remaining: 1,
        resetTime: now + window,
        retryAfter: 0,
      };
    }
  }

  getLimitConfig(tier: string) {
    return this.limits[tier] || this.limits.ip;
  }
}
