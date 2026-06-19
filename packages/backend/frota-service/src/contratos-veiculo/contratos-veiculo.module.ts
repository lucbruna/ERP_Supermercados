import { Module } from '@nestjs/common';
import { ContratosVeiculoController } from './contratos-veiculo.controller';
import { ContratosVeiculoService } from './contratos-veiculo.service';

@Module({
  controllers: [ContratosVeiculoController],
  providers: [ContratosVeiculoService],
  exports: [ContratosVeiculoService],
})
export class ContratosVeiculoModule {}
