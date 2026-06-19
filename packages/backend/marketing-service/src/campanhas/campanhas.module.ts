import { Module } from '@nestjs/common';
import { CampanhasController } from './campanhas.controller';
import { CampanhasService } from './campanhas.service';
import { DestinatariosModule } from '../destinatarios/destinatarios.module';
import { NotificacaoModule } from '../services/notificacao.module';

@Module({
  imports: [DestinatariosModule, NotificacaoModule],
  controllers: [CampanhasController],
  providers: [CampanhasService],
  exports: [CampanhasService],
})
export class CampanhasModule {}
