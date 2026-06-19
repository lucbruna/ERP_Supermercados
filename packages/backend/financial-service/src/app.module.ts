import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { ContasPagarModule } from './contas-pagar/contas-pagar.module';
import { ContasReceberModule } from './contas-receber/contas-receber.module';
import { FluxoCaixaModule } from './fluxo-caixa/fluxo-caixa.module';
import { BancosModule } from './bancos/bancos.module';
import { ConciliacaoModule } from './conciliacao/conciliacao.module';
import { PixModule } from './pix/pix.module';
import { CategoriasModule } from './categorias/categorias.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [
    PrismaModule,
    ContasPagarModule,
    ContasReceberModule,
    FluxoCaixaModule,
    BancosModule,
    ConciliacaoModule,
    PixModule,
    CategoriasModule,
    RelatoriosModule,
    GatewaysModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
