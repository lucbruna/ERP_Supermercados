import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  async send(
    token: string,
    title: string,
    body: string,
  ): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`[MOCK PUSH] Token: ${token.substring(0, 20)}... | Título: ${title}`);
    return {
      success: true,
      messageId: `push_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  async sendBulk(
    recipients: { token: string; title: string; body: string }[],
  ): Promise<{ success: boolean; messageId: string }[]> {
    return Promise.all(
      recipients.map((r) => this.send(r.token, r.title, r.body)),
    );
  }
}
