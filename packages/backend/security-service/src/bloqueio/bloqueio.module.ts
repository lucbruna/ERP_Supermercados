import { Module } from '@nestjs/common';
import { BloqueioController } from './bloqueio.controller';
import { BloqueioService } from './bloqueio.service';

@Module({
  controllers: [BloqueioController],
  providers: [BloqueioService],
  exports: [BloqueioService],
})
export class BloqueioModule {}
