import { Module } from '@nestjs/common';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';
import { IntegracaoModule } from '../integracao/integracao.module';

@Module({
  imports: [IntegracaoModule],
  controllers: [PagamentosController],
  providers: [PagamentosService],
  exports: [PagamentosService],
})
export class PagamentosModule {}
