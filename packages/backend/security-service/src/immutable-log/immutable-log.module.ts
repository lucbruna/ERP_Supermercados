import { Module } from '@nestjs/common';
import { ImmutableLogController } from './immutable-log.controller';
import { ImmutableLogService } from './immutable-log.service';

@Module({
  controllers: [ImmutableLogController],
  providers: [ImmutableLogService],
  exports: [ImmutableLogService],
})
export class ImmutableLogModule {}
