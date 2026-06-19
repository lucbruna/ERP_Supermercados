import { Module } from '@nestjs/common';
import { RecomendacoesController } from './recomendacoes.controller';
import { RecomendacoesService } from './recomendacoes.service';
import { RecomendacaoService } from '../services/recomendacao.service';

@Module({
  controllers: [RecomendacoesController],
  providers: [RecomendacoesService, RecomendacaoService],
  exports: [RecomendacoesService],
})
export class RecomendacoesModule {}
