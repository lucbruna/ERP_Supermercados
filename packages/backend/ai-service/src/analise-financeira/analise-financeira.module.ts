import { Module } from '@nestjs/common';
import { AnaliseFinanceiraController } from './analise-financeira.controller';
import { AnaliseFinanceiraService } from './analise-financeira.service';

@Module({
  controllers: [AnaliseFinanceiraController],
  providers: [AnaliseFinanceiraService],
  exports: [AnaliseFinanceiraService],
})
export class AnaliseFinanceiraModule {}
