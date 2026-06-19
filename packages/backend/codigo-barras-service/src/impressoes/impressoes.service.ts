import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateImpressaoDto, UpdateImpressaoStatusDto } from './dto/create-impressao.dto';
import { Prisma, StatusImpressao } from '@prisma/client';

@Injectable()
export class ImpressoesService {
  private readonly logger = new Logger(ImpressoesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateImpressaoDto) {
    const job = await this.prisma.impressaoEtiqueta.create({
      data: {
        etiquetaId: dto.etiquetaId,
        produtoIds: JSON.stringify(dto.produtoIds),
        quantidade: dto.quantidade,
        usuarioId: dto.usuarioId,
        observacoes: dto.observacoes,
      },
      include: { etiqueta: true },
    });

    this.logger.log(`Job de impressão criado: ${job.id}`);
    return { success: true, data: job };
  }

  async findAll(filters: {
    status?: StatusImpressao;
    usuarioId?: string;
    etiquetaId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ImpressaoEtiquetaWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.etiquetaId) where.etiquetaId = filters.etiquetaId;

    const [data, total] = await Promise.all([
      this.prisma.impressaoEtiqueta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { etiqueta: true },
      }),
      this.prisma.impressaoEtiqueta.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, dto: UpdateImpressaoStatusDto) {
    const job = await this.prisma.impressaoEtiqueta.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job de impressão não encontrado');

    const updated = await this.prisma.impressaoEtiqueta.update({
      where: { id },
      data: {
        status: dto.status as StatusImpressao,
        observacoes: dto.observacoes,
      },
      include: { etiqueta: true },
    });

    this.logger.log(`Job de impressão ${id} atualizado para ${dto.status}`);
    return { success: true, data: updated };
  }
}
