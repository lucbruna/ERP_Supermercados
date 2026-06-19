import { Module } from '@nestjs/common';
import { RecrutamentoController } from './recrutamento.controller';
import { RecrutamentoService } from './recrutamento.service';

@Module({
  controllers: [RecrutamentoController],
  providers: [RecrutamentoService],
  exports: [RecrutamentoService],
})
export class RecrutamentoModule {}
