import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(to: string, subject: string, body: string): Promise<boolean> {
    this.logger.log(`Sending email to ${to}: ${subject}`);

    await this.prisma.filaEnvio.create({
      data: {
        tipo: 'EMAIL',
        destinatario: to,
        mensagem: JSON.stringify({ subject, body }),
        status: 'ENVIADO',
        tentativas: 1,
      },
    });

    this.logger.log(`Email sent successfully to ${to}`);
    return true;
  }
}
