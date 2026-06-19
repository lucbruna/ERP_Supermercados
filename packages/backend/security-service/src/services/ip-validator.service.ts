import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class IpValidatorService {
  private readonly logger = new Logger(IpValidatorService.name);
  private readonly BLACKLISTED_RANGES = process.env.BLACKLISTED_IP_RANGES
    ? process.env.BLACKLISTED_IP_RANGES.split(',')
    : [];

  constructor(private prisma: PrismaService) {}

  async isValid(ip: string): Promise<{ valido: boolean; motivo?: string }> {
    if (this.isInBlacklistedRange(ip)) {
      return { valido: false, motivo: 'IP em faixa bloqueada globalmente' };
    }

    const bloqueio = await this.prisma.bloqueioIP.findFirst({
      where: {
        ip,
        ativo: true,
        dataInicio: { lte: new Date() },
        OR: [
          { dataFim: null },
          { dataFim: { gte: new Date() } },
        ],
      },
    });

    if (bloqueio) {
      return { valido: false, motivo: bloqueio.motivo };
    }

    return { valido: true };
  }

  async registrarTentativa(email: string, ip: string, userAgent: string, sucesso: boolean, motivo?: string) {
    await this.prisma.tentativaAcesso.create({
      data: { email, ip, userAgent, sucesso, motivo },
    });
  }

  async verificarTaxaLimite(ip: string, limite: number = 10, janelaMinutos: number = 15): Promise<boolean> {
    const janela = new Date();
    janela.setMinutes(janela.getMinutes() - janelaMinutos);

    const tentativasRecentes = await this.prisma.tentativaAcesso.count({
      where: {
        ip,
        sucesso: false,
        data: { gte: janela },
      },
    });

    return tentativasRecentes < limite;
  }

  private isInBlacklistedRange(ip: string): boolean {
    return this.BLACKLISTED_RANGES.some((range) => {
      if (range.includes('/')) {
        return this.ipMatchesCIDR(ip, range.trim());
      }
      return ip.startsWith(range.trim());
    });
  }

  private ipMatchesCIDR(ip: string, cidr: string): boolean {
    try {
      const [rangeIP, bitsStr] = cidr.split('/');
      const bits = parseInt(bitsStr, 10);

      const ipNum = this.ipToLong(ip);
      const rangeNum = this.ipToLong(rangeIP);
      const mask = ~(2 ** (32 - bits) - 1);

      return (ipNum & mask) === (rangeNum & mask);
    } catch {
      return false;
    }
  }

  private ipToLong(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  }
}
