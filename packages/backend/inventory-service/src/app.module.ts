import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { ProdutosModule } from './produtos/produtos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { MovimentosModule } from './movimentos/movimentos.module';
import { LotesModule } from './lotes/lotes.module';
import { InventarioModule } from './inventario/inventario.module';
import { TransferenciasModule } from './transferencias/transferencias.module';
import { CurvaAbcModule } from './curva-abc/curva-abc.module';
import { SugestaoCompraModule } from './sugestao-compra/sugestao-compra.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProdutosModule,
    CategoriasModule,
    MovimentosModule,
    LotesModule,
    InventarioModule,
    TransferenciasModule,
    CurvaAbcModule,
    SugestaoCompraModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
