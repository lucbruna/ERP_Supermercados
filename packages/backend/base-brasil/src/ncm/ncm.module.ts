import { Module } from '@nestjs/common';
import { NcmController } from './ncm.controller';
import { NcmService } from './ncm.service';

@Module({
  controllers: [NcmController],
  providers: [NcmService],
  exports: [NcmService],
})
export class NcmModule {}
