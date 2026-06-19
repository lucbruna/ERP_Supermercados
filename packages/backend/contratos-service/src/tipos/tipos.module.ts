import { Module } from '@nestjs/common';
import { TiposController } from './tipos.controller';
import { TiposService } from './tipos.service';

@Module({
  controllers: [TiposController],
  providers: [TiposService],
  exports: [TiposService],
})
export class TiposModule {}
