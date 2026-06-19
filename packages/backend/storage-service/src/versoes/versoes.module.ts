import { Module } from '@nestjs/common';
import { VersoesController } from './versoes.controller';
import { VersoesService } from './versoes.service';

@Module({
  controllers: [VersoesController],
  providers: [VersoesService],
  exports: [VersoesService],
})
export class VersoesModule {}
