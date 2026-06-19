import { Module, forwardRef } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { CreditoModule } from '../credito/credito.module';
import { CobrancaModule } from '../cobranca/cobranca.module';
import { ComprasModule } from '../compras/compras.module';

@Module({
  imports: [CreditoModule, CobrancaModule, ComprasModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
