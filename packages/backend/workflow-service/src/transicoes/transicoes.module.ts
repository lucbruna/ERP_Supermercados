import { Module } from '@nestjs/common';
import { TransicoesController } from './transicoes.controller';
import { TransicoesService } from './transicoes.service';

@Module({
  controllers: [TransicoesController],
  providers: [TransicoesService],
  exports: [TransicoesService],
})
export class TransicoesModule {}
