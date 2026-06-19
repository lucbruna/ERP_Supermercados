import { Module } from '@nestjs/common';
import { NotificacoesController, FilaEnvioController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';
import { EmailSenderService } from '../services/email-sender.service';
import { SmsSenderService } from '../services/sms-sender.service';
import { WhatsappSenderService } from '../services/whatsapp-sender.service';
import { PushSenderService } from '../services/push-sender.service';
import { NotificationQueueService } from '../services/notification-queue.service';

@Module({
  controllers: [NotificacoesController, FilaEnvioController],
  providers: [
    NotificacoesService,
    EmailSenderService,
    SmsSenderService,
    WhatsappSenderService,
    PushSenderService,
    NotificationQueueService,
  ],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
