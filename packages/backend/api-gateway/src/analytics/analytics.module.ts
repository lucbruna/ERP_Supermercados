import { Module } from '@nestjs/common';
import { SecurityAnalyticsController } from './security-analytics.controller';
import { SecurityAnalyticsService } from './security-analytics.service';

@Module({
  controllers: [SecurityAnalyticsController],
  providers: [SecurityAnalyticsService],
  exports: [SecurityAnalyticsService],
})
export class AnalyticsModule {}
