import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async send(to: string, message: string): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`[MOCK SMS] Enviando para ${to}: ${message.substring(0, 50)}...`);
    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  async sendBulk(
    recipients: { to: string; message: string }[],
  ): Promise<{ success: boolean; messageId: string }[]> {
    return Promise.all(
      recipients.map((r) => this.send(r.to, r.message)),
    );
  }
}
