import { Module } from '@nestjs/common';
import { BeneficioController } from './beneficio.controller';
import { BeneficioService } from './beneficio.service';

@Module({
  controllers: [BeneficioController],
  providers: [BeneficioService],
  exports: [BeneficioService],
})
export class BeneficioModule {}
