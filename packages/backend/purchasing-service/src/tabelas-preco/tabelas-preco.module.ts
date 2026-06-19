import { Module } from '@nestjs/common';
import { TabelasPrecoController } from './tabelas-preco.controller';
import { TabelasPrecoService } from './tabelas-preco.service';

@Module({
  controllers: [TabelasPrecoController],
  providers: [TabelasPrecoService],
  exports: [TabelasPrecoService],
})
export class TabelasPrecoModule {}
