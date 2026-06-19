import { Module } from '@nestjs/common';
import { ConveniosController } from './convenios.controller';
import { ConveniosService } from './convenios.service';

@Module({
  controllers: [ConveniosController],
  providers: [ConveniosService],
  exports: [ConveniosService],
})
export class ConveniosModule {}
