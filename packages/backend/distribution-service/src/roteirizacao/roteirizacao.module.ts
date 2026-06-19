import { Module } from '@nestjs/common';
import { RoteirizacaoController } from './roteirizacao.controller';
import { RoteirizacaoService } from './roteirizacao.service';
import { RoteirizadorService } from '../services/roteirizador.service';

@Module({
  controllers: [RoteirizacaoController],
  providers: [RoteirizacaoService, RoteirizadorService],
  exports: [RoteirizacaoService],
})
export class RoteirizacaoModule {}
