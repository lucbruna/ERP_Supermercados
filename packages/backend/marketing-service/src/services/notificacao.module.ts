import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';

@Module({
  providers: [WhatsappService, EmailService, SmsService, PushService],
  exports: [WhatsappService, EmailService, SmsService, PushService],
})
export class NotificacaoModule {}
