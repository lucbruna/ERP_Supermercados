import { Module } from '@nestjs/common';
import { CertificacoesController } from './certificacoes.controller';
import { CertificacoesService } from './certificacoes.service';

@Module({
  controllers: [CertificacoesController],
  providers: [CertificacoesService],
  exports: [CertificacoesService],
})
export class CertificacoesModule {}
