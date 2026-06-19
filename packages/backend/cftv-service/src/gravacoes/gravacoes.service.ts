import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { GravacaoQueryDto } from './dto/gravacao.dto';

@Injectable()
export class GravacoesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: GravacaoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { camera: { companyId } };
    if (query.cameraId) where.cameraId = query.cameraId;
    if (query.status) where.status = query.status;
    if (query.dataInicio || query.dataFim) {
      where.dataInicio = {};
      if (query.dataInicio) where.dataInicio.gte = new Date(query.dataInicio);
      if (query.dataFim) where.dataFim = { lte: new Date(query.dataFim) };
    }

    const [gravacoes, total] = await Promise.all([
      this.prisma.gravacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataInicio: 'desc' },
        include: { camera: { select: { id: true, nome: true } } },
      }),
      this.prisma.gravacao.count({ where }),
    ]);

    return {
      success: true,
      data: gravacoes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const gravacao = await this.prisma.gravacao.findUnique({
      where: { id },
      include: { camera: true },
    });
    if (!gravacao) throw new NotFoundException('Gravação não encontrada');
    return { success: true, data: gravacao };
  }

  async findByCamera(cameraId: string, query: GravacaoQueryDto) {
    return this.findAll('', { ...query, cameraId });
  }

  async getResumo(companyId: string) {
    const [total, porStatus, totalHoras] = await Promise.all([
      this.prisma.gravacao.count({ where: { camera: { companyId } } }),
      this.prisma.gravacao.groupBy({
        by: ['status'],
        where: { camera: { companyId } },
        _count: true,
      }),
      this.prisma.gravacao.findMany({
        where: { camera: { companyId }, status: 'FINALIZADA' },
        select: { dataInicio: true, dataFim: true },
      }),
    ]);

    return {
      success: true,
      data: { total, porStatus },
    };
  }
}
