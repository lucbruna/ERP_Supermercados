import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SmsSenderService {
  private readonly logger = new Logger(SmsSenderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(to: string, message: string): Promise<boolean> {
    this.logger.log(`Sending SMS to ${to}`);

    await this.prisma.filaEnvio.create({
      data: {
        tipo: 'SMS',
        destinatario: to,
        mensagem: message,
        status: 'ENVIADO',
        tentativas: 1,
      },
    });

    this.logger.log(`SMS sent successfully to ${to}`);
    return true;
  }
}
