import { Module } from '@nestjs/common';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';
import { ReportGeneratorService } from '../services/report-generator.service';

@Module({
  controllers: [RelatoriosController],
  providers: [RelatoriosService, ReportGeneratorService],
  exports: [RelatoriosService],
})
export class RelatoriosModule {}
