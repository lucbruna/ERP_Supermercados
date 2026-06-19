import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { ServicesModule } from './services/services.module';
import { ClientesModule } from './clientes/clientes.module';
import { FidelidadeModule } from './fidelidade/fidelidade.module';
import { CuponsModule } from './cupons/cupons.module';
import { CashbackModule } from './cashback/cashback.module';
import { PontosModule } from './pontos/pontos.module';
import { SegmentacaoModule } from './segmentacao/segmentacao.module';
import { CreditoModule } from './credito/credito.module';
import { CobrancaModule } from './cobranca/cobranca.module';
import { ComprasModule } from './compras/compras.module';

@Module({
  imports: [
    PrismaModule,
    ServicesModule,
    ClientesModule,
    FidelidadeModule,
    CuponsModule,
    CashbackModule,
    PontosModule,
    SegmentacaoModule,
    CreditoModule,
    CobrancaModule,
    ComprasModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
