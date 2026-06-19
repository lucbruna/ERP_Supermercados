import { Module } from '@nestjs/common';
import { TreinamentoController } from './treinamento.controller';
import { TreinamentoService } from './treinamento.service';

@Module({
  controllers: [TreinamentoController],
  providers: [TreinamentoService],
  exports: [TreinamentoService],
})
export class TreinamentoModule {}
