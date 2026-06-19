import { Module } from '@nestjs/common';
import { SegmentacaoController } from './segmentacao.controller';
import { SegmentacaoService } from './segmentacao.service';

@Module({
  controllers: [SegmentacaoController],
  providers: [SegmentacaoService],
  exports: [SegmentacaoService],
})
export class SegmentacaoModule {}
