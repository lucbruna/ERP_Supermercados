import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { GerarRecomendacaoDto, RecomendacaoQueryDto, CreateRecomendacaoDto } from '../dto/recomendacao.dto';
import { RecomendacaoService } from '../services/recomendacao.service';

@Injectable()
export class RecomendacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recomendador: RecomendacaoService,
  ) {}

  async generate(dto: GerarRecomendacaoDto) {
    const recomendacoes = await this.recomendador.generate(dto.tipo, dto.produtoId);
    for (const rec of recomendacoes) {
      await this.prisma.recomendacao.create({ data: rec });
    }
    return recomendacoes;
  }

  async findAll(query: RecomendacaoQueryDto) {
    const where: any = {};
    if (query.tipo) where.tipo = query.tipo;
    if (query.prioridade) where.prioridade = query.prioridade;
    return this.prisma.recomendacao.findMany({
      where,
      orderBy: { data: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.recomendacao.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Recommendation not found');
    return record;
  }

  async create(dto: CreateRecomendacaoDto) {
    return this.prisma.recomendacao.create({ data: dto });
  }

  async markProcessed(id: string) {
    await this.findOne(id);
    return this.prisma.recomendacao.update({
      where: { id },
      data: { processado: true },
    });
  }
}
