import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AlertaPayload {
  cameraId: string;
  eventoId?: string;
  tipo: string;
  mensagem: string;
  destinatarios: string[];
  metadata?: Record<string, any>;
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly notificationServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.notificationServiceUrl =
      process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004/api/v1/notifications';
  }

  async enviarAlerta(payload: AlertaPayload): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/enviar`, {
          tipo: 'ALERTA_CFTV',
          titulo: `Alerta: ${payload.tipo}`,
          mensagem: payload.mensagem,
          destinatarios: payload.destinatarios,
          metadata: {
            cameraId: payload.cameraId,
            eventoId: payload.eventoId,
            tipo: payload.tipo,
            ...payload.metadata,
          },
        }),
      );

      this.logger.log(`Alerta enviado com sucesso: ${payload.tipo}`);
      return response.data?.success ?? true;
    } catch (error) {
      this.logger.error(`Falha ao enviar alerta: ${error.message}`);
      return false;
    }
  }

  async enviarAlertasEmLote(alertas: AlertaPayload[]): Promise<{
    enviados: number;
    falhos: number;
  }> {
    let enviados = 0;
    let falhos = 0;

    for (const alerta of alertas) {
      const sucesso = await this.enviarAlerta(alerta);
      if (sucesso) {
        enviados++;
      } else {
        falhos++;
      }
    }

    return { enviados, falhos };
  }

  async notificarEmail(destinatario: string, assunto: string, corpo: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/email`, {
          para: destinatario,
          assunto,
          corpo,
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Falha ao enviar email: ${error.message}`);
      return false;
    }
  }

  async notificarSMS(destinatario: string, mensagem: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/sms`, {
          para: destinatario,
          mensagem,
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Falha ao enviar SMS: ${error.message}`);
      return false;
    }
  }
}
