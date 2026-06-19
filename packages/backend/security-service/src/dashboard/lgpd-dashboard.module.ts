import { Module } from '@nestjs/common';
import { LgpdDashboardController } from './lgpd-dashboard.controller';
import { LgpdDashboardService } from './lgpd-dashboard.service';

@Module({
  controllers: [LgpdDashboardController],
  providers: [LgpdDashboardService],
  exports: [LgpdDashboardService],
})
export class LgpdDashboardModule {}
