import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { CobrancaController } from './cobranca.controller';
import { CobrancaService } from './cobranca.service';

@Module({
  imports: [PrismaModule],
  controllers: [CobrancaController],
  providers: [CobrancaService],
  exports: [CobrancaService],
})
export class CobrancaModule {}
