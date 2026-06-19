import { Module } from '@nestjs/common';
import { PastasController } from './pastas.controller';
import { PastasService } from './pastas.service';

@Module({
  controllers: [PastasController],
  providers: [PastasService],
  exports: [PastasService],
})
export class PastasModule {}
