import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { ContratosModule } from './contratos/contratos.module';
import { TiposModule } from './tipos/tipos.module';
import { RescisoesModule } from './rescisoes/rescisoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ContratosModule,
    TiposModule,
    RescisoesModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
