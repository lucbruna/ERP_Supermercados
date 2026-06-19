import { Module } from '@nestjs/common';
import { ConciliacaoController } from './conciliacao.controller';
import { ConciliacaoService } from './conciliacao.service';

@Module({
  controllers: [ConciliacaoController],
  providers: [ConciliacaoService],
  exports: [ConciliacaoService],
})
export class ConciliacaoModule {}
