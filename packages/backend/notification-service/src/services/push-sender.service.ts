import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PushSenderService {
  private readonly logger = new Logger(PushSenderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(deviceToken: string, title: string, body: string): Promise<boolean> {
    this.logger.log(`Sending push notification to ${deviceToken}: ${title}`);

    await this.prisma.filaEnvio.create({
      data: {
        tipo: 'PUSH',
        destinatario: deviceToken,
        mensagem: JSON.stringify({ title, body }),
        status: 'ENVIADO',
        tentativas: 1,
      },
    });

    this.logger.log(`Push notification sent successfully to ${deviceToken}`);
    return true;
  }
}
