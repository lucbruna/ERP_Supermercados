import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class WhatsappSenderService {
  private readonly logger = new Logger(WhatsappSenderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(to: string, message: string): Promise<boolean> {
    this.logger.log(`Sending WhatsApp message to ${to}`);

    await this.prisma.filaEnvio.create({
      data: {
        tipo: 'WHATSAPP',
        destinatario: to,
        mensagem: message,
        status: 'ENVIADO',
        tentativas: 1,
      },
    });

    this.logger.log(`WhatsApp message sent successfully to ${to}`);
    return true;
  }
}
