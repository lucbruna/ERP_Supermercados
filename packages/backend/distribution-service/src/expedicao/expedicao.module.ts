import { Module } from '@nestjs/common';
import { ExpedicaoController } from './expedicao.controller';
import { ExpedicaoService } from './expedicao.service';

@Module({
  controllers: [ExpedicaoController],
  providers: [ExpedicaoService],
  exports: [ExpedicaoService],
})
export class ExpedicaoModule {}
