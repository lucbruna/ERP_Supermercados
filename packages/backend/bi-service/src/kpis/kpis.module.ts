import { Module } from '@nestjs/common';
import { KpisController } from './kpis.controller';
import { KpisService } from './kpis.service';
import { KpiCalculatorService } from '../services/kpi-calculator.service';

@Module({
  controllers: [KpisController],
  providers: [KpisService, KpiCalculatorService],
  exports: [KpisService],
})
export class KpisModule {}
