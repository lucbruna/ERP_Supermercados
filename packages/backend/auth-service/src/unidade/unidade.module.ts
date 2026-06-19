import { Module } from '@nestjs/common';
import { UnidadeController } from './unidade.controller';
import { UnidadeService } from './unidade.service';
import { EmpresaModule } from '../empresa/empresa.module';

@Module({
  imports: [EmpresaModule],
  controllers: [UnidadeController],
  providers: [UnidadeService],
  exports: [UnidadeService],
})
export class UnidadeModule {}
