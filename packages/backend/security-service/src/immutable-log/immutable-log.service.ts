import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

interface LogEntry {
  index: number;
  timestamp: string;
  acao: string;
  usuarioId: string;
  dados: any;
  hashAnterior: string;
  hash: string;
}

interface StoredLog {
  id: bigint;
  index: number;
  timestamp: Date;
  acao: string;
  usuarioId: string;
  dados: any;
  hashAnterior: string;
  hash: string;
}

@Injectable()
export class ImmutableLogService {
  private computeHash(
    index: number,
    timestamp: string,
    acao: string,
    usuarioId: string,
    dados: any,
    hashAnterior: string,
  ): string {
    const payload = `${index}|${timestamp}|${acao}|${usuarioId}|${JSON.stringify(dados)}|${hashAnterior}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  async append(dto: { acao: string; usuarioId: string; dados?: any }): Promise<LogEntry> {
    const lastLog = await this.getLastLog();
    const index = lastLog ? lastLog.index + 1 : 1;
    const timestamp = new Date().toISOString();
    const hashAnterior = lastLog ? lastLog.hash : '0'.repeat(64);
    const hash = this.computeHash(index, timestamp, dto.acao, dto.usuarioId, dto.dados, hashAnterior);

    return {
      index,
      timestamp,
      acao: dto.acao,
      usuarioId: dto.usuarioId,
      dados: dto.dados,
      hashAnterior,
      hash,
    };
  }

  async verifyChain(fromIndex: number, toIndex: number): Promise<{ valid: boolean; brokenAt?: number }> {
    if (fromIndex > toIndex) {
      throw new BadRequestException('fromIndex must be less than or equal to toIndex');
    }

    const logs = await this.getRange(fromIndex, toIndex);
    if (logs.length === 0) {
      return { valid: true };
    }

    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1];
      const curr = logs[i];

      if (curr.hashAnterior !== prev.hash) {
        return { valid: false, brokenAt: curr.index };
      }

      const expectedHash = this.computeHash(
        curr.index,
        curr.timestamp.toISOString(),
        curr.acao,
        curr.usuarioId,
        curr.dados,
        curr.hashAnterior,
      );

      if (curr.hash !== expectedHash) {
        return { valid: false, brokenAt: curr.index };
      }
    }

    const firstLog = logs[0];
    const expectedFirstHash = this.computeHash(
      firstLog.index,
      firstLog.timestamp.toISOString(),
      firstLog.acao,
      firstLog.usuarioId,
      firstLog.dados,
      firstLog.hashAnterior,
    );

    if (firstLog.hash !== expectedFirstHash) {
      return { valid: false, brokenAt: firstLog.index };
    }

    return { valid: true };
  }

  async verifyEntry(id: number): Promise<{ valid: boolean }> {
    const log = await this.getLogById(id);
    if (!log) {
      throw new NotFoundException('Log entry not found');
    }

    const expectedHash = this.computeHash(
      log.index,
      log.timestamp.toISOString(),
      log.acao,
      log.usuarioId,
      log.dados,
      log.hashAnterior,
    );

    return { valid: log.hash === expectedHash };
  }

  async getRange(fromIndex: number, toIndex: number): Promise<StoredLog[]> {
    if (fromIndex > toIndex) {
      throw new BadRequestException('fromIndex must be less than or equal to toIndex');
    }

    return [];
  }

  async getLastLog(): Promise<StoredLog | null> {
    return null;
  }

  async getLogById(id: number): Promise<StoredLog | null> {
    return null;
  }
}
