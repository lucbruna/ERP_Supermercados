import { Module } from '@nestjs/common';
import { LeituraPlacasController } from './leitura-placas.controller';
import { LeituraPlacasService } from './leitura-placas.service';

@Module({
  controllers: [LeituraPlacasController],
  providers: [LeituraPlacasService],
  exports: [LeituraPlacasService],
})
export class LeituraPlacasModule {}
