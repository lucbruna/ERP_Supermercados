import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { PushService } from '../push/push.service';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly whatsappService: WhatsappService,
    private readonly pushService: PushService,
    private readonly prisma: PrismaService,
  ) {}

  private async logNotification(channel: string, to: string | undefined, subject: string | undefined, message: string | undefined, status: string, error?: string) {
    try {
      await this.prisma.notificationLog.create({
        data: { channel, to, subject, message, status, error },
      });
    } catch (e) {
      this.logger.warn(`Failed to log notification: ${e.message}`);
    }
  }

  async notifyEmail(to: string, subject: string, template?: string, context?: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
    const result = await this.emailService.send(to, subject, template, context);
    await this.logNotification('EMAIL', to, subject, context?.message || subject, result.success ? 'ENVIADO' : 'ERRO', result.error);
    return result;
  }

  async notifySms(to: string, message: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const result = await this.smsService.send(to, message);
    await this.logNotification('SMS', to, undefined, message, result.success ? 'ENVIADO' : 'ERRO', result.error);
    return result;
  }

  async notifyWhatsapp(to: string, message: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const result = await this.whatsappService.send(to, message);
    await this.logNotification('WHATSAPP', to, undefined, message, result.success ? 'ENVIADO' : 'ERRO', result.error);
    return result;
  }

  async notifyPush(token: string, payload: { title: string; body: string; data?: Record<string, string> }): Promise<{ success: boolean; data?: any; error?: string }> {
    const result = await this.pushService.sendToDevice(token, payload);
    await this.logNotification('PUSH', token, payload.title, payload.body, result.success ? 'ENVIADO' : 'ERRO', result.error);
    return result;
  }

  async notifyAll(to: string, subject: string, message: string): Promise<{ success: boolean; results: any[] }> {
    const results = await Promise.allSettled([
      this.notifyEmail(to, subject, undefined, { message }),
      this.notifySms(to, message),
      this.notifyWhatsapp(to, message),
    ]);
    const mapped = results.map((r, i) => {
      const channels = ['EMAIL', 'SMS', 'WHATSAPP'];
      return { channel: channels[i], status: r.status === 'fulfilled' ? (r.value as any).success ? 'ENVIADO' : 'ERRO' : 'ERRO' };
    });
    return { success: mapped.some((r) => r.status === 'ENVIADO'), results: mapped };
  }

  async getNotificationStatus(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const log = await this.prisma.notificationLog.findUnique({ where: { id } });
      if (!log) return { success: false, error: 'Notification not found' };
      return { success: true, data: log };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
