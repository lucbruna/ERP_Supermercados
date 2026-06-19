import { Module } from '@nestjs/common';
import { SeparacaoController } from './separacao.controller';
import { SeparacaoService } from './separacao.service';

@Module({
  controllers: [SeparacaoController],
  providers: [SeparacaoService],
  exports: [SeparacaoService],
})
export class SeparacaoModule {}
