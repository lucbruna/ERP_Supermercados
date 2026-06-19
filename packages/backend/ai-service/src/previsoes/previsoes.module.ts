import { Module } from '@nestjs/common';
import { PrevisoesController } from './previsoes.controller';
import { PrevisoesService } from './previsoes.service';
import { PrevisaoVendasService } from '../services/previsao-vendas.service';

@Module({
  controllers: [PrevisoesController],
  providers: [PrevisoesService, PrevisaoVendasService],
  exports: [PrevisoesService],
})
export class PrevisoesModule {}
