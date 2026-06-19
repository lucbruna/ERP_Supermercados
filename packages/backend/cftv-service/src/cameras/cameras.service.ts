import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CriarCameraDto, AtualizarCameraDto } from './dto/camera.dto';

@Injectable()
export class CamerasService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: { page?: number; limit?: number; status?: string; unidadeId?: string; tipo?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.status) where.status = query.status;
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    if (query.tipo) where.tipo = query.tipo;

    const [cameras, total] = await Promise.all([
      this.prisma.camera.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.camera.count({ where }),
    ]);

    return {
      success: true,
      data: cameras,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const camera = await this.prisma.camera.findUnique({
      where: { id },
      include: { eventos: { take: 10, orderBy: { dataHora: 'desc' } } },
    });
    if (!camera) throw new NotFoundException('Câmera não encontrada');
    return { success: true, data: camera };
  }

  async create(companyId: string, unidadeId: string, dto: CriarCameraDto) {
    const camera = await this.prisma.camera.create({
      data: {
        companyId,
        unidadeId,
        nome: dto.nome,
        ip: dto.ip,
        porta: dto.porta,
        tipo: dto.tipo || 'IP',
        protocolo: dto.protocolo || 'RTSP',
        resolucao: dto.resolucao,
        localizacao: dto.localizacao,
        urlStream: dto.urlStream,
        urlSnapshot: dto.urlSnapshot,
        hasAI: dto.hasAI ?? false,
        deteccoes: dto.deteccoes || [],
      },
    });
    return { success: true, data: camera };
  }

  async update(id: string, dto: AtualizarCameraDto) {
    const camera = await this.prisma.camera.findUnique({ where: { id } });
    if (!camera) throw new NotFoundException('Câmera não encontrada');

    const updated = await this.prisma.camera.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.ip !== undefined && { ip: dto.ip }),
        ...(dto.porta !== undefined && { porta: dto.porta }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.protocolo !== undefined && { protocolo: dto.protocolo }),
        ...(dto.resolucao !== undefined && { resolucao: dto.resolucao }),
        ...(dto.localizacao !== undefined && { localizacao: dto.localizacao }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.urlStream !== undefined && { urlStream: dto.urlStream }),
        ...(dto.urlSnapshot !== undefined && { urlSnapshot: dto.urlSnapshot }),
        ...(dto.hasAI !== undefined && { hasAI: dto.hasAI }),
        ...(dto.deteccoes !== undefined && { deteccoes: dto.deteccoes }),
      },
    });
    return { success: true, data: updated };
  }

  async updateStatus(id: string, status: string) {
    const camera = await this.prisma.camera.findUnique({ where: { id } });
    if (!camera) throw new NotFoundException('Câmera não encontrada');

    const updated = await this.prisma.camera.update({
      where: { id },
      data: { status },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const camera = await this.prisma.camera.findUnique({ where: { id } });
    if (!camera) throw new NotFoundException('Câmera não encontrada');

    await this.prisma.camera.delete({ where: { id } });
    return { success: true, message: 'Câmera removida com sucesso' };
  }

  async getResumo(companyId: string) {
    const [total, porStatus, onlineCount] = await Promise.all([
      this.prisma.camera.count({ where: { companyId } }),
      this.prisma.camera.groupBy({ by: ['status'], where: { companyId }, _count: true }),
      this.prisma.camera.count({ where: { companyId, status: 'ONLINE' } }),
    ]);

    return {
      success: true,
      data: { total, online: onlineCount, offline: total - onlineCount, porStatus },
    };
  }
}
