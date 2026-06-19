import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { CepModule } from './cep/cep.module';
import { IbgeModule } from './ibge/ibge.module';
import { NcmModule } from './ncm/ncm.module';
import { CfopModule } from './cfop/cfop.module';
import { ValidacaoModule } from './validacao/validacao.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CepModule,
    IbgeModule,
    NcmModule,
    CfopModule,
    ValidacaoModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
