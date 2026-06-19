import { Module } from '@nestjs/common';
import { SangriaController } from './sangria.controller';
import { SangriaService } from './sangria.service';

@Module({
  controllers: [SangriaController],
  providers: [SangriaService],
  exports: [SangriaService],
})
export class SangriaModule {}
