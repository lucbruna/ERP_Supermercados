import { Module } from '@nestjs/common';
import { ComportamentoController } from './comportamento.controller';
import { ComportamentoService } from './comportamento.service';

@Module({
  controllers: [ComportamentoController],
  providers: [ComportamentoService],
  exports: [ComportamentoService],
})
export class ComportamentoModule {}
