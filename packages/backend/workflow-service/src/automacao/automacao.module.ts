import { Module } from '@nestjs/common';
import { AutomacaoController } from './automacao.controller';
import { AutomacaoService } from './automacao.service';

@Module({
  controllers: [AutomacaoController],
  providers: [AutomacaoService],
  exports: [AutomacaoService],
})
export class AutomacaoModule {}
