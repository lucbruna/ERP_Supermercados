import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { LeituraPlacaQueryDto, CriarLeituraPlacaDto } from './dto/leitura-placa.dto';

@Injectable()
export class LeituraPlacasService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: LeituraPlacaQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { camera: { companyId } };
    if (query.cameraId) where.cameraId = query.cameraId;
    if (query.placa) where.placa = { contains: query.placa, mode: 'insensitive' };
    if (query.confiancaMinima) where.confianca = { gte: query.confiancaMinima };

    const [leituras, total] = await Promise.all([
      this.prisma.leituraPlaca.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: { camera: { select: { id: true, nome: true, localizacao: true } } },
      }),
      this.prisma.leituraPlaca.count({ where }),
    ]);

    return {
      success: true,
      data: leituras,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const leitura = await this.prisma.leituraPlaca.findUnique({
      where: { id },
      include: { camera: true },
    });
    if (!leitura) throw new NotFoundException('Leitura de placa não encontrada');
    return { success: true, data: leitura };
  }

  async create(dto: CriarLeituraPlacaDto) {
    const leitura = await this.prisma.leituraPlaca.create({
      data: {
        cameraId: dto.cameraId,
        snapshotUrl: dto.snapshotUrl,
        placa: dto.placa,
        confianca: dto.confianca,
        metadata: dto.metadata || undefined,
      },
    });
    return { success: true, data: leitura };
  }

  async buscarPorPlaca(companyId: string, placa: string) {
    const leituras = await this.prisma.leituraPlaca.findMany({
      where: { placa: { contains: placa, mode: 'insensitive' }, camera: { companyId } },
      orderBy: { data: 'desc' },
      include: { camera: { select: { id: true, nome: true, localizacao: true } } },
    });
    return { success: true, data: leituras };
  }
}
