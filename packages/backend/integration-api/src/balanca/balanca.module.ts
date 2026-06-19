import { Module } from '@nestjs/common';
import { BalancaController } from './balanca.controller';
import { BalancaService } from './balanca.service';

@Module({ controllers: [BalancaController], providers: [BalancaService], exports: [BalancaService] })
export class BalancaModule {}
