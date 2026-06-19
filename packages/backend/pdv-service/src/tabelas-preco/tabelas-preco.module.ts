import { Module } from '@nestjs/common';
import { TabelasPrecoController } from './tabelas-preco.controller';
import { TabelasPrecoService } from './tabelas-preco.service';
import { PrismaModule } from '../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TabelasPrecoController],
  providers: [TabelasPrecoService],
  exports: [TabelasPrecoService],
})
export class TabelasPrecoModule {}
