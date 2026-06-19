import { Module } from '@nestjs/common';
import { AutomacoesController } from './automacoes.controller';
import { AutomacoesService } from './automacoes.service';
import { CampanhasModule } from '../campanhas/campanhas.module';

@Module({
  imports: [CampanhasModule],
  controllers: [AutomacoesController],
  providers: [AutomacoesService],
  exports: [AutomacoesService],
})
export class AutomacoesModule {}
