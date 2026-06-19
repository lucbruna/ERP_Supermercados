import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { CfopModule } from './cfop/cfop.module';
import { NFeModule } from './nfe/nfe.module';
import { NFceModule } from './nfce/nfce.module';
import { SpedModule } from './sped/sped.module';
import { ConfiguracaoModule } from './configuracao/configuracao.module';
import { TributosModule } from './tributos/tributos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CfopModule,
    NFeModule,
    NFceModule,
    SpedModule,
    ConfiguracaoModule,
    TributosModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
