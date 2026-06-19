import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { CodigosModule } from './codigos/codigos.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { ImpressoesModule } from './impressoes/impressoes.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CodigosModule,
    EtiquetasModule,
    ImpressoesModule,
    RelatoriosModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
