import { Module } from '@nestjs/common';
import { NFeController } from './nfe.controller';
import { NFeService } from './nfe.service';

@Module({
  controllers: [NFeController],
  providers: [NFeService],
  exports: [NFeService],
})
export class NFeModule {}
