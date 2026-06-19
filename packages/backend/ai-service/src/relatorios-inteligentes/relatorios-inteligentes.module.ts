import { Module } from '@nestjs/common';
import { RelatoriosInteligentesController } from './relatorios-inteligentes.controller';
import { RelatoriosInteligentesService } from './relatorios-inteligentes.service';

@Module({
  controllers: [RelatoriosInteligentesController],
  providers: [RelatoriosInteligentesService],
  exports: [RelatoriosInteligentesService],
})
export class RelatoriosInteligentesModule {}
