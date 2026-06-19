import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { RateLimiter } from '../common/rate-limiter';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly rateLimiter = new RateLimiter(100, 60000);
  private readonly smtpConfigured: boolean;

  constructor(private readonly mailerService: MailerService) {
    this.smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    if (!this.smtpConfigured) {
      this.logger.warn('SMTP not configured. Email will use mock mode.');
    }
  }

  async send(to: string, subject: string, template?: string, context?: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.rateLimiter.check('email')) {
      return { success: false, error: 'Rate limit exceeded (100/min)' };
    }

    if (!this.smtpConfigured) {
      this.logger.log(`[mock] Email to ${to}: ${subject} [template: ${template || 'none'}]`);
      return { success: true, data: { mock: true, to, subject } };
    }

    try {
      if (template) {
        await this.mailerService.sendMail({
          to,
          subject,
          template,
          context: context || {},
        });
      } else {
        await this.mailerService.sendMail({
          to,
          subject,
          html: context?.body || context?.message || subject,
        });
      }
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return { success: true, data: { to, subject } };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordReset(to: string, token: string, name: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.send(to, 'Redefinição de Senha', 'password-reset', { token, name, year: new Date().getFullYear() });
  }

  async sendWelcome(to: string, name: string, companyName: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.send(to, `Bem-vindo ao ${companyName}`, 'welcome', { name, companyName, year: new Date().getFullYear() });
  }

  async sendInvoice(to: string, invoiceNumber: string, amount: number, dueDate: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.send(to, `Fatura #${invoiceNumber}`, 'invoice', { invoiceNumber, amount, dueDate, year: new Date().getFullYear() });
  }

  async sendReport(to: string, reportName: string, period: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.send(to, `Relatório: ${reportName}`, 'report', { reportName, period, year: new Date().getFullYear() });
  }

  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.smtpConfigured) {
      return { success: false, error: 'SMTP not configured' };
    }
    try {
      await this.mailerService.sendMail({
        to: process.env.EMAIL_FROM || 'test@example.com',
        subject: 'Teste de Conexão SMTP',
        text: 'Se você recebeu este e-mail, a conexão SMTP está funcionando corretamente.',
      });
      return { success: true, data: { message: 'SMTP connection successful' } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
