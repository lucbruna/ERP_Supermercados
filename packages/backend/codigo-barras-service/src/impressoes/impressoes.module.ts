import { Module } from '@nestjs/common';
import { ImpressoesController } from './impressoes.controller';
import { ImpressoesService } from './impressoes.service';

@Module({
  controllers: [ImpressoesController],
  providers: [ImpressoesService],
  exports: [ImpressoesService],
})
export class ImpressoesModule {}
