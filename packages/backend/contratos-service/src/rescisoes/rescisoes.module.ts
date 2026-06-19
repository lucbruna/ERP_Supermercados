import { Module } from '@nestjs/common';
import { RescisoesController } from './rescisoes.controller';
import { RescisoesService } from './rescisoes.service';

@Module({
  controllers: [RescisoesController],
  providers: [RescisoesService],
  exports: [RescisoesService],
})
export class RescisoesModule {}
