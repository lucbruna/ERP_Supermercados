import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class InventoryClient {
  private readonly logger = new Logger(InventoryClient.name);
  private readonly baseUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005';

  async darEntrada(produtoId: string, quantidade: number, motivo: string, vendaId: string) {
    try {
      const { data } = await axios.post(`${this.baseUrl}/api/v1/movimento/entrada`, {
        produtoId,
        quantidade,
        tipo: 'AJUSTE',
        motivo: `Estorno venda ${vendaId}: ${motivo}`,
        documento: vendaId,
      }, { timeout: 5000 });
      this.logger.log(`Estoque retornado: ${produtoId} qtd=${quantidade}`);
      return data;
    } catch (error: any) {
      this.logger.error(`Erro ao retornar estoque: ${error.message}`);
      throw error;
    }
  }
}
