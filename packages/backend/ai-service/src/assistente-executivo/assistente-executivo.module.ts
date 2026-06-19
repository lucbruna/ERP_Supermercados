import { Module } from '@nestjs/common';
import { AssistenteExecutivoController } from './assistente-executivo.controller';
import { AssistenteExecutivoService } from './assistente-executivo.service';

@Module({
  controllers: [AssistenteExecutivoController],
  providers: [AssistenteExecutivoService],
  exports: [AssistenteExecutivoService],
})
export class AssistenteExecutivoModule {}
