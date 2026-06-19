import { Injectable, Logger } from '@nestjs/common';
import { FreteCacheEntry } from './correios.dto';

@Injectable()
export class RatesCache {
  private readonly logger = new Logger(RatesCache.name);
  private readonly cache: Map<string, FreteCacheEntry> = new Map();
  private readonly TTL = 60 * 60 * 1000;

  private gerarChave(cepOrigem: string, cepDestino: string, servico: string, peso: number): string {
    return `${servico}:${cepOrigem}:${cepDestino}:${peso}`;
  }

  get(cepOrigem: string, cepDestino: string, servico: string, peso: number): FreteCacheEntry | null {
    const chave = this.gerarChave(cepOrigem, cepDestino, servico, peso);
    const entry = this.cache.get(chave);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(chave);
      this.logger.debug(`Cache expirado: ${chave}`);
      return null;
    }
    this.logger.debug(`Cache hit: ${chave}`);
    return entry;
  }

  set(cepOrigem: string, cepDestino: string, servico: string, peso: number, valor: number, prazo: number): void {
    const chave = this.gerarChave(cepOrigem, cepDestino, servico, peso);
    this.cache.set(chave, { chave, servico, valor, prazo, timestamp: Date.now() });
    this.logger.debug(`Cache set: ${chave}`);
  }

  clear(): void {
    this.cache.clear();
    this.logger.log('Cache de fretes limpo');
  }

  limparExpirados(): void {
    const agora = Date.now();
    let removidos = 0;
    for (const [chave, entry] of this.cache.entries()) {
      if (agora - entry.timestamp > this.TTL) {
        this.cache.delete(chave);
        removidos++;
      }
    }
    if (removidos > 0) this.logger.log(`${removidos} entradas expiradas removidas do cache`);
  }
}
