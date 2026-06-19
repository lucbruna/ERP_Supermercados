import { Module } from '@nestjs/common';
import { InstanciasController } from './instancias.controller';
import { InstanciasService } from './instancias.service';

@Module({
  controllers: [InstanciasController],
  providers: [InstanciasService],
  exports: [InstanciasService],
})
export class InstanciasModule {}
