import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { GatewayModule } from './gateway/gateway.module';
import { RedisModule } from './common/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { RateLimitGuard } from './rate-limit/rate-limit.guard';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [GatewayModule, RedisModule, PrismaModule, ApiKeysModule, RateLimitModule, AnalyticsModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: RateLimitGuard },
  ],
})
export class AppModule {}
