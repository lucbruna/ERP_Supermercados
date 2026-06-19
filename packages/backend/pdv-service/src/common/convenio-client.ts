import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ConvenioClient {
  private readonly logger = new Logger(ConvenioClient.name);
  private readonly baseUrl = process.env.CONVENIO_SERVICE_URL || 'http://convenio-service:3010';

  async registrarVenda(dados: { vendaId: string; clienteId: string; valor: number; data: Date; itens: any[] }) {
    try {
      const { data } = await axios.post(`${this.baseUrl}/api/vendas`, dados, { timeout: 5000 });
      this.logger.log(`Venda registrada no convênio: ${dados.vendaId}`);
      return data;
    } catch (error: any) {
      this.logger.error(`Erro ao registrar venda no convênio: ${error.message}`);
      throw error;
    }
  }

  async cancelarVenda(vendaId: string, clienteId: string, valor: number) {
    try {
      const { data } = await axios.post(`${this.baseUrl}/api/vendas/cancelar`, { vendaId, clienteId, valor }, { timeout: 5000 });
      this.logger.log(`Venda cancelada no convênio: ${vendaId}`);
      return data;
    } catch (error: any) {
      this.logger.error(`Erro ao cancelar venda no convênio: ${error.message}`);
      throw error;
    }
  }
}
