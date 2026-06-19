import { Module } from '@nestjs/common';
import { ArquivosController } from './arquivos.controller';
import { ArquivosService } from './arquivos.service';

@Module({
  controllers: [ArquivosController],
  providers: [ArquivosService],
  exports: [ArquivosService],
})
export class ArquivosModule {}
