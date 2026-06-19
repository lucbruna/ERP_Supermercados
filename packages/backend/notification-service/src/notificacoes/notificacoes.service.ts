import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateNotificacaoDto, NotificacaoQueryDto, SendNotificacaoDto } from '../dto/notificacao.dto';
import { NotificationQueueService } from '../services/notification-queue.service';
import { TipoNotificacao } from '@prisma/client';

@Injectable()
export class NotificacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: NotificationQueueService,
  ) {}

  async create(dto: CreateNotificacaoDto) {
    return this.prisma.notificacao.create({ data: dto });
  }

  async findAll(query: NotificacaoQueryDto) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.usuarioId) where.usuarioId = query.usuarioId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.lida !== undefined) where.lida = query.lida === 'true';
    return this.prisma.notificacao.findMany({
      where,
      orderBy: { dataEnvio: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.notificacao.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Notification not found');
    return record;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.notificacao.delete({ where: { id } });
  }

  async markRead(id: string) {
    await this.findOne(id);
    return this.prisma.notificacao.update({
      where: { id },
      data: { lida: true, dataLeitura: new Date() },
    });
  }

  async send(dto: SendNotificacaoDto) {
    const notificacao = await this.prisma.notificacao.create({
      data: {
        companyId: dto.companyId,
        usuarioId: dto.usuarioId,
        tipo: dto.tipo,
        titulo: dto.titulo,
        mensagem: dto.mensagem,
      },
    });

    await this.queue.enqueue({
      tipo: dto.tipo as TipoNotificacao,
      destinatario: dto.destinatario,
      mensagem: dto.mensagem,
      titulo: dto.titulo,
    });

    return notificacao;
  }

  async markAllRead(companyId: string, usuarioId?: string) {
    const where: any = { companyId, lida: false };
    if (usuarioId) where.usuarioId = usuarioId;
    return this.prisma.notificacao.updateMany({
      where,
      data: { lida: true, dataLeitura: new Date() },
    });
  }
}
