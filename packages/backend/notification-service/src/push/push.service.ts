import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RateLimiter } from '../common/rate-limiter';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly rateLimiter = new RateLimiter(100, 60000);
  private readonly fcmConfigured: boolean;

  constructor() {
    this.fcmConfigured = !!process.env.FCM_SERVER_KEY;
    if (!this.fcmConfigured) {
      this.logger.warn('FCM not configured. Push will use mock mode.');
    }
  }

  async sendToDevice(token: string, payload: { title: string; body: string; data?: Record<string, string> }): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.rateLimiter.check('push')) {
      return { success: false, error: 'Rate limit exceeded (100/min)' };
    }

    if (!this.fcmConfigured) {
      this.logger.log(`[mock] Push to device ${token}: ${payload.title} - ${payload.body}`);
      return { success: true, data: { mock: true, token } };
    }

    try {
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        {
          to: token,
          notification: { title: payload.title, body: payload.body },
          data: payload.data || {},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.FCM_SERVER_KEY}`,
          },
        },
      );
      this.logger.log(`Push sent to device ${token}: ${response.data?.message_id || 'ok'}`);
      return { success: true, data: { messageId: response.data?.message_id, token } };
    } catch (error) {
      this.logger.error(`Failed to send push to device ${token}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendToTopic(topic: string, payload: { title: string; body: string; data?: Record<string, string> }): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.rateLimiter.check('push')) {
      return { success: false, error: 'Rate limit exceeded (100/min)' };
    }

    if (!this.fcmConfigured) {
      this.logger.log(`[mock] Push to topic ${topic}: ${payload.title} - ${payload.body}`);
      return { success: true, data: { mock: true, topic } };
    }

    try {
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        {
          to: `/topics/${topic}`,
          notification: { title: payload.title, body: payload.body },
          data: payload.data || {},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.FCM_SERVER_KEY}`,
          },
        },
      );
      this.logger.log(`Push sent to topic ${topic}: ${response.data?.message_id || 'ok'}`);
      return { success: true, data: { messageId: response.data?.message_id, topic } };
    } catch (error) {
      this.logger.error(`Failed to send push to topic ${topic}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
