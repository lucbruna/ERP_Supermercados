import { Module } from '@nestjs/common';
import { TrocasController } from './trocas.controller';
import { TrocasService } from './trocas.service';

@Module({
  controllers: [TrocasController],
  providers: [TrocasService],
  exports: [TrocasService],
})
export class TrocasModule {}
