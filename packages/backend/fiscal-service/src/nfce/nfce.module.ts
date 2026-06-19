import { Module } from '@nestjs/common';
import { NFceController } from './nfce.controller';
import { NFceService } from './nfce.service';

@Module({
  controllers: [NFceController],
  providers: [NFceService],
  exports: [NFceService],
})
export class NFceModule {}
