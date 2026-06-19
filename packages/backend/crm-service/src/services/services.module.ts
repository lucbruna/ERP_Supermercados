import { Global, Module } from '@nestjs/common';
import { CashbackService } from './cashback-service';
import { PontuacaoService } from './pontuacao-service';

@Global()
@Module({
  providers: [CashbackService, PontuacaoService],
  exports: [CashbackService, PontuacaoService],
})
export class ServicesModule {}
