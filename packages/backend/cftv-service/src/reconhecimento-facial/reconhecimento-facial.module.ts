import { Module } from '@nestjs/common';
import { ReconhecimentoFacialController } from './reconhecimento-facial.controller';
import { ReconhecimentoFacialService } from './reconhecimento-facial.service';

@Module({
  controllers: [ReconhecimentoFacialController],
  providers: [ReconhecimentoFacialService],
  exports: [ReconhecimentoFacialService],
})
export class ReconhecimentoFacialModule {}
