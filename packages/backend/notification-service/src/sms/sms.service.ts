import { Injectable, Logger } from '@nestjs/common';
import { RateLimiter } from '../common/rate-limiter';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly rateLimiter = new RateLimiter(100, 60000);
  private readonly twilioConfigured: boolean;
  private twilioClient: any;

  constructor() {
    this.twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
    if (this.twilioConfigured) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      } catch {
        this.logger.warn('Twilio module not available, using mock mode');
        this.twilioConfigured = false;
      }
    }
    if (!this.twilioConfigured) {
      this.logger.warn('Twilio not configured. SMS will use mock mode.');
    }
  }

  async send(to: string, message: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.rateLimiter.check('sms')) {
      return { success: false, error: 'Rate limit exceeded (100/min)' };
    }

    if (!this.twilioConfigured || !this.twilioClient) {
      this.logger.log(`[mock] SMS to ${to}: ${message}`);
      return { success: true, data: { mock: true, to } };
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      this.logger.log(`SMS sent to ${to}: ${result.sid}`);
      return { success: true, data: { sid: result.sid, to } };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendAlert(to: string, alertType: string, details: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.send(to, `[ALERTA] ${alertType}: ${details}`);
  }

  async sendPromotion(to: string, promotionName: string, discount: string, validUntil: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.send(to, `Promoção: ${promotionName} - ${discount} de desconto! Válido até ${validUntil}.`);
  }
}
