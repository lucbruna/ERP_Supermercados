import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AnalisarTransacaoDto, FraudeQueryDto } from '../dto/fraude.dto';
import { DeteccaoFraudeService } from '../services/deteccao-fraude.service';

@Injectable()
export class FraudeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly detector: DeteccaoFraudeService,
  ) {}

  async analyze(dto: AnalisarTransacaoDto) {
    const result = await this.detector.analyzeTransaction(dto.transacaoId, dto.valor, dto.clienteId, dto.localizacao);
    return this.prisma.deteccaoFraude.create({ data: result });
  }

  async findAll(query: FraudeQueryDto) {
    const where: any = {};
    if (query.tipo) where.tipo = query.tipo;
    if (query.processado !== undefined) where.processado = query.processado === 'true';
    return this.prisma.deteccaoFraude.findMany({
      where,
      orderBy: { data: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.deteccaoFraude.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Fraud detection not found');
    return record;
  }

  async markProcessed(id: string) {
    await this.findOne(id);
    return this.prisma.deteccaoFraude.update({
      where: { id },
      data: { processado: true },
    });
  }
}
