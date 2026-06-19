import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(
    to: string,
    subject: string,
    body: string,
  ): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`[MOCK EMAIL] Para: ${to} | Assunto: ${subject}`);
    return {
      success: true,
      messageId: `em_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  async sendBulk(
    recipients: { to: string; subject: string; body: string }[],
  ): Promise<{ success: boolean; messageId: string }[]> {
    return Promise.all(
      recipients.map((r) => this.send(r.to, r.subject, r.body)),
    );
  }
}
