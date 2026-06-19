import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EventoQueryDto } from './dto/evento-query.dto';

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: EventoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      camera: { companyId },
    };
    if (query.cameraId) where.cameraId = query.cameraId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.confiancaMinima) where.confianca = { gte: query.confiancaMinima };
    if (query.processado !== undefined) where.processado = query.processado;
    if (query.dataInicio || query.dataFim) {
      where.dataHora = {};
      if (query.dataInicio) where.dataHora.gte = new Date(query.dataInicio);
      if (query.dataFim) where.dataHora.lte = new Date(query.dataFim);
    }

    const [eventos, total] = await Promise.all([
      this.prisma.eventoCamera.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataHora: 'desc' },
        include: { camera: { select: { id: true, nome: true, localizacao: true } } },
      }),
      this.prisma.eventoCamera.count({ where }),
    ]);

    return {
      success: true,
      data: eventos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const evento = await this.prisma.eventoCamera.findUnique({
      where: { id },
      include: { camera: true, alertas: true },
    });
    return { success: true, data: evento };
  }

  async getResumo(companyId: string) {
    const [total, porTipo, ultimosEventos] = await Promise.all([
      this.prisma.eventoCamera.count({ where: { camera: { companyId } } }),
      this.prisma.eventoCamera.groupBy({
        by: ['tipo'],
        where: { camera: { companyId } },
        _count: true,
      }),
      this.prisma.eventoCamera.findMany({
        where: { camera: { companyId } },
        orderBy: { dataHora: 'desc' },
        take: 20,
        include: { camera: { select: { id: true, nome: true } } },
      }),
    ]);

    return {
      success: true,
      data: { total, porTipo, ultimosEventos },
    };
  }
}
