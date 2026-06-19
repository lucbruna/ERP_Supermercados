import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RescisaoQueryDto, RescisaoRelatorioDto } from './dto/create-rescisao.dto';

@Injectable()
export class RescisoesService {
  private readonly logger = new Logger(RescisoesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: RescisaoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { ativo: true };
    if (query.tipoRescisao) where.tipoRescisao = query.tipoRescisao;
    if (query.contratoId) where.contratoId = query.contratoId;
    if (query.dataInicio || query.dataFim) {
      where.dataRescisao = {};
      if (query.dataInicio) where.dataRescisao.gte = new Date(query.dataInicio);
      if (query.dataFim) where.dataRescisao.lte = new Date(query.dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.termoRescisao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataRescisao: 'desc' },
        include: {
          contrato: { select: { numero: true, funcionarioId: true, cargo: true } },
        },
      }),
      this.prisma.termoRescisao.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const rescisao = await this.prisma.termoRescisao.findUnique({
      where: { id },
      include: {
        contrato: {
          include: { tipoContrato: true },
        },
      },
    });
    if (!rescisao) throw new NotFoundException('Termo de rescisão não encontrado');
    return { success: true, data: rescisao };
  }

  async relatorio(query: RescisaoRelatorioDto) {
    const where: any = { ativo: true };
    if (query.dataInicio || query.dataFim) {
      where.dataRescisao = {};
      if (query.dataInicio) where.dataRescisao.gte = new Date(query.dataInicio);
      if (query.dataFim) where.dataRescisao.lte = new Date(query.dataFim);
    }

    const [totalRescisoes, valorTotal, porMotivo, rescisoes] = await Promise.all([
      this.prisma.termoRescisao.count({ where }),
      this.prisma.termoRescisao.aggregate({
        where,
        _sum: { valorTotal: true },
        _avg: { valorTotal: true },
      }),
      this.prisma.termoRescisao.groupBy({
        by: ['tipoRescisao'],
        where,
        _count: { id: true },
        _sum: { valorTotal: true },
      }),
      this.prisma.termoRescisao.findMany({
        where,
        orderBy: { dataRescisao: 'desc' },
        include: {
          contrato: { select: { numero: true, funcionarioId: true, cargo: true } },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        periodo: {
          inicio: query.dataInicio,
          fim: query.dataFim,
        },
        totalRescisoes,
        valorTotal: valorTotal._sum.valorTotal,
        valorMedio: valorTotal._avg.valorTotal,
        porMotivo: porMotivo.map((m) => ({
          tipo: m.tipoRescisao,
          quantidade: m._count.id,
          valorTotal: m._sum.valorTotal,
        })),
        rescisoes,
      },
    };
  }

  async remove(id: string) {
    const rescisao = await this.findOne(id);
    await this.prisma.termoRescisao.update({
      where: { id },
      data: { ativo: false },
    });
    this.logger.log(`Rescisão ${id} removida (soft delete)`);
    return { success: true, message: 'Rescisão removida com sucesso' };
  }
}
