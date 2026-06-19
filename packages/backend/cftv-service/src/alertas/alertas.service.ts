import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CriarAlertaDto, AlertaQueryDto } from './dto/alerta.dto';

@Injectable()
export class AlertasService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: AlertaQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { camera: { companyId } };
    if (query.cameraId) where.cameraId = query.cameraId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.enviado !== undefined) where.enviado = query.enviado;

    const [alertas, total] = await Promise.all([
      this.prisma.alertaCFTV.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { camera: { select: { id: true, nome: true } } },
      }),
      this.prisma.alertaCFTV.count({ where }),
    ]);

    return {
      success: true,
      data: alertas,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const alerta = await this.prisma.alertaCFTV.findUnique({
      where: { id },
      include: { camera: true, evento: true },
    });
    if (!alerta) throw new NotFoundException('Alerta não encontrado');
    return { success: true, data: alerta };
  }

  async create(dto: CriarAlertaDto) {
    const alerta = await this.prisma.alertaCFTV.create({
      data: {
        cameraId: dto.cameraId,
        eventoId: dto.eventoId,
        tipo: dto.tipo,
        mensagem: dto.mensagem,
        destinatarios: dto.destinatarios,
      },
    });
    return { success: true, data: alerta };
  }

  async marcarEnviado(id: string) {
    const alerta = await this.prisma.alertaCFTV.findUnique({ where: { id } });
    if (!alerta) throw new NotFoundException('Alerta não encontrado');

    const updated = await this.prisma.alertaCFTV.update({
      where: { id },
      data: { enviado: true, dataEnvio: new Date() },
    });
    return { success: true, data: updated };
  }

  async getNaoEnviados() {
    const alertas = await this.prisma.alertaCFTV.findMany({
      where: { enviado: false },
      include: { camera: true, evento: true },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: alertas };
  }
}
