import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { ProvidersModule } from './providers/providers.module';
import { UploadModule } from './upload/upload.module';
import { DownloadModule } from './download/download.module';
import { ArquivosModule } from './arquivos/arquivos.module';
import { PastasModule } from './pastas/pastas.module';
import { ProcessamentoModule } from './processamento/processamento.module';
import { VersoesModule } from './versoes/versoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProvidersModule,
    UploadModule,
    DownloadModule,
    ArquivosModule,
    PastasModule,
    ProcessamentoModule,
    VersoesModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
