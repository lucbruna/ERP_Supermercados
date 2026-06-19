import { Injectable, Logger } from '@nestjs/common';
import { RateLimiter } from '../common/rate-limiter';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly rateLimiter = new RateLimiter(100, 60000);
  private readonly configured: boolean;
  private twilioClient: any;

  constructor() {
    this.configured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER);
    if (this.configured) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      } catch {
        this.logger.warn('Twilio module not available, using mock mode');
        this.configured = false;
      }
    }
    if (!this.configured) {
      this.logger.warn('Twilio WhatsApp not configured. WhatsApp will use mock mode.');
    }
  }

  async send(to: string, message: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.rateLimiter.check('whatsapp')) {
      return { success: false, error: 'Rate limit exceeded (100/min)' };
    }

    if (!this.configured || !this.twilioClient) {
      this.logger.log(`[mock] WhatsApp to ${to}: ${message}`);
      return { success: true, data: { mock: true, to } };
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`,
      });
      this.logger.log(`WhatsApp sent to ${to}: ${result.sid}`);
      return { success: true, data: { sid: result.sid, to } };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendTemplate(to: string, templateName: string, variables: Record<string, string>): Promise<{ success: boolean; data?: any; error?: string }> {
    const message = Object.entries(variables).reduce((msg, [key, val]) => msg.replace(`{{${key}}}`, val), templateName);
    return this.send(to, message);
  }
}
