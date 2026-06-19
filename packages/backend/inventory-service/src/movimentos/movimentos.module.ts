import { Module } from '@nestjs/common';
import { MovimentosController } from './movimentos.controller';
import { MovimentosService } from './movimentos.service';

@Module({
  controllers: [MovimentosController],
  providers: [MovimentosService],
  exports: [MovimentosService],
})
export class MovimentosModule {}
