import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CrmClient {
  private readonly logger = new Logger(CrmClient.name);
  private readonly baseUrl = process.env.CRM_SERVICE_URL || 'http://crm-service:3002';

  async creditarPontos(clienteId: string, vendaId: string, valor: number) {
    try {
      const pontos = Math.floor(valor * 0.01);
      const { data } = await axios.post(`${this.baseUrl}/api/pontos/creditar`, {
        clienteId,
        vendaId,
        pontos,
        valor,
      }, { timeout: 5000 });
      this.logger.log(`Pontos creditados: ${pontos} para cliente ${clienteId}`);
      return { data, pontos };
    } catch (error: any) {
      this.logger.error(`Erro ao creditar pontos: ${error.message}`);
      return { pontos: 0 };
    }
  }

  async debitarPontos(clienteId: string, vendaId: string, pontos: number) {
    try {
      const { data } = await axios.post(`${this.baseUrl}/api/pontos/debitar`, {
        clienteId,
        vendaId,
        pontos,
      }, { timeout: 5000 });
      this.logger.log(`Pontos debitados: ${pontos} para cliente ${clienteId}`);
      return data;
    } catch (error: any) {
      this.logger.error(`Erro ao debitar pontos: ${error.message}`);
    }
  }
}
