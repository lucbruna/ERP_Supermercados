import { Module } from '@nestjs/common';
import { TributosController } from './tributos.controller';
import { TributosService } from './tributos.service';

@Module({
  controllers: [TributosController],
  providers: [TributosService],
  exports: [TributosService],
})
export class TributosModule {}
