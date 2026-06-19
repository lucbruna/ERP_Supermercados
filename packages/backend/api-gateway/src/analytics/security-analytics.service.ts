import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/redis.service';

@Injectable()
export class SecurityAnalyticsService {
  private readonly logger = new Logger(SecurityAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getApiUsage(days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const keys = await this.prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        tier: true,
        usageCount: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    const totalRequests = keys.reduce((sum, k) => sum + k.usageCount, 0);
    const activeKeys = keys.filter((k) => k.lastUsedAt && k.lastUsedAt >= since).length;
    const topKeys = [...keys].sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);

    return {
      success: true,
      data: {
        period: `${days} days`,
        totalRequests,
        activeKeys,
        totalKeys: keys.length,
        topKeys,
      },
    };
  }

  async getAuthAttempts(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const audits = await this.prisma.auditLog.findMany({
      where: {
        acao: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const success = audits.filter((a) => a.acao === 'LOGIN_SUCCESS').length;
    const failed = audits.filter((a) => a.acao === 'LOGIN_FAILED').length;

    const ipMap = new Map<string, number>();
    for (const audit of audits) {
      ipMap.set(audit.ip, (ipMap.get(audit.ip) || 0) + 1);
    }
    const topIps = [...ipMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([ip, count]) => ({ ip, count }));

    return {
      success: true,
      data: {
        period: `${days} days`,
        total: audits.length,
        success,
        failed,
        successRate: audits.length > 0 ? `${((success / audits.length) * 100).toFixed(1)}%` : '0%',
        topIps,
      },
    };
  }

  async getRateLimitHits(days: number = 7) {
    const since = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const keys = await this.redis.getClient().keys('ratelimit:*');

    const routeMap = new Map<string, number>();
    const ipMap = new Map<string, number>();

    for (const key of keys) {
      const parts = key.split(':');
      if (parts.length >= 2) {
        const tier = parts[1];
        const identifier = parts.slice(2).join(':');

        const count = parseInt(await this.redis.get(key) || '0', 10);

        if (tier === 'ip') {
          ipMap.set(identifier, (ipMap.get(identifier) || 0) + count);
        } else {
          routeMap.set(tier, (routeMap.get(tier) || 0) + count);
        }
      }
    }

    const topIps = [...ipMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([ip, count]) => ({ ip, count }));

    return {
      success: true,
      data: {
        period: `${days} days`,
        totalEntries: keys.length,
        byRoute: [...routeMap.entries()].map(([route, count]) => ({ route, count })),
        topIps,
      },
    };
  }
}
