import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { KpisModule } from './kpis/kpis.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { IndicadoresModule } from './indicadores/indicadores.module';

@Module({
  imports: [
    PrismaModule,
    KpisModule,
    RelatoriosModule,
    DashboardsModule,
    IndicadoresModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
