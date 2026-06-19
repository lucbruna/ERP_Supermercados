import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { PdvModule } from './pdv/pdv.module';
import { VendasModule } from './vendas/vendas.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { TrocasModule } from './trocas/trocas.module';
import { SangriaModule } from './sangria/sangria.module';
import { IntegracaoModule } from './integracao/integracao.module';
import { TabelasPrecoModule } from './tabelas-preco/tabelas-preco.module';
import { MesasModule } from './mesas/mesas.module';
import { DeliveryModule } from './delivery/delivery.module';
import { CuponsModule } from './cupons/cupons.module';
import { DisplayModule } from './display/display.module';
import { PrecosModule } from './precos/precos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    PdvModule,
    VendasModule,
    PagamentosModule,
    TrocasModule,
    SangriaModule,
    IntegracaoModule,
    TabelasPrecoModule,
    MesasModule,
    DeliveryModule,
    CuponsModule,
    DisplayModule,
    PrecosModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
