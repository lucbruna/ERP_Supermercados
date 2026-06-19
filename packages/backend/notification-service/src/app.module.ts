import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { TemplatesModule } from './templates/templates.module';
import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { PushModule } from './push/push.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    NotificacoesModule,
    TemplatesModule,
    EmailModule,
    SmsModule,
    WhatsappModule,
    PushModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
