import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { CotacoesModule } from './cotacoes/cotacoes.module';
import { PedidosCompraModule } from './pedidos-compra/pedidos-compra.module';
import { RecebimentoModule } from './recebimento/recebimento.module';
import { ContratosModule } from './contratos/contratos.module';
import { TabelasPrecoModule } from './tabelas-preco/tabelas-preco.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';

@Module({
  imports: [
    PrismaModule,
    FornecedoresModule,
    CotacoesModule,
    PedidosCompraModule,
    RecebimentoModule,
    ContratosModule,
    TabelasPrecoModule,
    AvaliacoesModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
