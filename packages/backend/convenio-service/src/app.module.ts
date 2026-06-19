import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { ConveniosModule } from './convenios/convenios.module';
import { ContratosModule } from './contratos/contratos.module';
import { FaturasModule } from './faturas/faturas.module';
import { VendasModule } from './vendas/vendas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ConveniosModule,
    ContratosModule,
    FaturasModule,
    VendasModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
