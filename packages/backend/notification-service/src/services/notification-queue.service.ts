import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EmailSenderService } from './email-sender.service';
import { SmsSenderService } from './sms-sender.service';
import { WhatsappSenderService } from './whatsapp-sender.service';
import { PushSenderService } from './push-sender.service';
import { TipoNotificacao, StatusFila } from '@prisma/client';

interface QueueItem {
  tipo: TipoNotificacao;
  destinatario: string;
  mensagem: string;
  titulo?: string;
}

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);
  private readonly maxRetries = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailSender: EmailSenderService,
    private readonly smsSender: SmsSenderService,
    private readonly whatsappSender: WhatsappSenderService,
    private readonly pushSender: PushSenderService,
  ) {}

  async enqueue(item: QueueItem): Promise<void> {
    this.logger.log(`Enqueueing ${item.tipo} notification for ${item.destinatario}`);

    await this.prisma.filaEnvio.create({
      data: {
        tipo: item.tipo,
        destinatario: item.destinatario,
        mensagem: item.mensagem,
        status: 'PENDENTE',
        tentativas: 0,
      },
    });
  }

  async processQueue(): Promise<void> {
    this.logger.log('Processing notification queue');

    const pending = await this.prisma.filaEnvio.findMany({
      where: {
        status: 'PENDENTE',
        OR: [
          { proximaTentativa: null },
          { proximaTentativa: { lte: new Date() } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    for (const item of pending) {
      try {
        let success = false;

        switch (item.tipo) {
          case 'EMAIL':
            const emailData = JSON.parse(item.mensagem);
            success = await this.emailSender.send(item.destinatario, emailData.subject || 'Notificação', emailData.body || item.mensagem);
            break;
          case 'SMS':
            success = await this.smsSender.send(item.destinatario, item.mensagem);
            break;
          case 'WHATSAPP':
            success = await this.whatsappSender.send(item.destinatario, item.mensagem);
            break;
          case 'PUSH':
            const pushData = JSON.parse(item.mensagem);
            success = await this.pushSender.send(item.destinatario, pushData.title || 'Notificação', pushData.body || item.mensagem);
            break;
          default:
            success = false;
        }

        if (success) {
          await this.prisma.filaEnvio.update({
            where: { id: item.id },
            data: { status: 'ENVIADO' },
          });
        } else {
          throw new Error('Send failed');
        }
      } catch (error) {
        const novasTentativas = item.tentativas + 1;
        const updateData: any = {
          tentativas: novasTentativas,
          erro: error.message,
        };

        if (novasTentativas >= this.maxRetries) {
          updateData.status = 'ERRO';
          this.logger.error(`Failed to send ${item.tipo} to ${item.destinatario} after ${novasTentativas} attempts`);
        } else {
          updateData.proximaTentativa = new Date(Date.now() + Math.pow(2, novasTentativas) * 60000);
        }

        await this.prisma.filaEnvio.update({
          where: { id: item.id },
          data: updateData,
        });
      }
    }
  }

  async getQueueStats() {
    const [pending, sent, error] = await Promise.all([
      this.prisma.filaEnvio.count({ where: { status: 'PENDENTE' } }),
      this.prisma.filaEnvio.count({ where: { status: 'ENVIADO' } }),
      this.prisma.filaEnvio.count({ where: { status: 'ERRO' } }),
    ]);

    return { pending, sent, error, total: pending + sent + error };
  }
}
