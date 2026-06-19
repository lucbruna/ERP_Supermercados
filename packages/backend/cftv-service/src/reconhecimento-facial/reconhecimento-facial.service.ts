import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ReconhecimentoQueryDto, CriarReconhecimentoDto } from './dto/reconhecimento.dto';

@Injectable()
export class ReconhecimentoFacialService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: ReconhecimentoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { camera: { companyId } };
    if (query.cameraId) where.cameraId = query.cameraId;
    if (query.nome) where.nome = { contains: query.nome, mode: 'insensitive' };
    if (query.desconhecido !== undefined) where.desconhecido = query.desconhecido;
    if (query.confiancaMinima) where.confianca = { gte: query.confiancaMinima };

    const [reconhecimentos, total] = await Promise.all([
      this.prisma.reconhecimentoFacial.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: { camera: { select: { id: true, nome: true, localizacao: true } } },
      }),
      this.prisma.reconhecimentoFacial.count({ where }),
    ]);

    return {
      success: true,
      data: reconhecimentos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const reconhecimento = await this.prisma.reconhecimentoFacial.findUnique({
      where: { id },
      include: { camera: true },
    });
    if (!reconhecimento) throw new NotFoundException('Reconhecimento não encontrado');
    return { success: true, data: reconhecimento };
  }

  async create(dto: CriarReconhecimentoDto) {
    const reconhecimento = await this.prisma.reconhecimentoFacial.create({
      data: {
        cameraId: dto.cameraId,
        snapshotUrl: dto.snapshotUrl,
        nome: dto.nome,
        confianca: dto.confianca,
        desconhecido: dto.desconhecido ?? true,
        metadata: dto.metadata || undefined,
      },
    });
    return { success: true, data: reconhecimento };
  }

  async getResumo(companyId: string) {
    const [total, desconhecidosCount, porCamera] = await Promise.all([
      this.prisma.reconhecimentoFacial.count({ where: { camera: { companyId } } }),
      this.prisma.reconhecimentoFacial.count({ where: { camera: { companyId }, desconhecido: true } }),
      this.prisma.reconhecimentoFacial.groupBy({
        by: ['cameraId'],
        where: { camera: { companyId } },
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: { total, desconhecidos: desconhecidosCount, conhecidos: total - desconhecidosCount, porCamera },
    };
  }
}
