import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const sessions = await this.prisma.sessao.findMany({
      where: { userId },
      orderBy: { dataInicio: 'desc' },
      select: {
        id: true,
        ip: true,
        dispositivo: true,
        userAgent: true,
        dataInicio: true,
        dataExpiracao: true,
        ativo: true,
      },
    });
    return { success: true, data: sessions };
  }

  async findOne(id: string) {
    const session = await this.prisma.sessao.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Sessão não encontrada');
    return { success: true, session };
  }

  async revoke(id: string) {
    const session = await this.prisma.sessao.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Sessão não encontrada');

    await this.prisma.sessao.update({
      where: { id },
      data: { ativo: false, dataFim: new Date() },
    });

    return { success: true, message: 'Sessão revogada' };
  }

  async revokeAll(userId: string, exceptSessionId?: string) {
    const where: any = { userId, ativo: true };
    if (exceptSessionId) where.id = { not: exceptSessionId };

    await this.prisma.sessao.updateMany({
      where,
      data: { ativo: false, dataFim: new Date() },
    });

    return { success: true, message: 'Todas as sessões foram revogadas' };
  }
}
