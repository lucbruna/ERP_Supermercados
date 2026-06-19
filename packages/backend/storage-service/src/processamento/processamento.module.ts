import { Module } from '@nestjs/common';
import { ProcessamentoController } from './processamento.controller';
import { ProcessamentoService } from './processamento.service';

@Module({
  controllers: [ProcessamentoController],
  providers: [ProcessamentoService],
  exports: [ProcessamentoService],
})
export class ProcessamentoModule {}
