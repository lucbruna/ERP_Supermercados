import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateTrocaDto,
  UpdateTrocaStatusDto,
  TrocaQueryDto,
} from './dto/troca.dto';
import { VendaStatus, TrocaStatus } from '@prisma/client';

@Injectable()
export class TrocasService {
  private readonly logger = new Logger(TrocasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTrocaDto) {
    const venda = await this.prisma.venda.findUnique({ where: { id: dto.vendaId } });
    if (!venda) throw new NotFoundException('Venda não encontrada');
    if (venda.status !== VendaStatus.FINALIZADA) {
      throw new BadRequestException('Apenas vendas finalizadas podem ter trocas');
    }

    const troca = await this.prisma.troca.create({
      data: {
        vendaId: dto.vendaId,
        itensTrocados: JSON.parse(JSON.stringify(dto.itensTrocados)),
        itensNovos: JSON.parse(JSON.stringify(dto.itensNovos)),
        diferenca: dto.diferenca,
        tipo: (dto.tipo as any) || 'TROCA_DIRETA',
        status: TrocaStatus.PENDENTE,
        operadorId: dto.operadorId,
      },
    });

    await this.prisma.venda.update({
      where: { id: dto.vendaId },
      data: { status: VendaStatus.TROCA },
    });

    this.logger.log(`Troca criada para venda ${venda.numero}`);
    return { success: true, data: troca };
  }

  async findAll(query: TrocaQueryDto) {
    const where: any = {};
    if (query.vendaId) where.vendaId = query.vendaId;
    if (query.status) where.status = query.status;

    const trocas = await this.prisma.troca.findMany({
      where,
      include: { venda: true },
      orderBy: { data: 'desc' },
    });
    return { success: true, data: trocas };
  }

  async findOne(id: string) {
    const troca = await this.prisma.troca.findUnique({
      where: { id },
      include: { venda: true },
    });
    if (!troca) throw new NotFoundException('Troca não encontrada');
    return { success: true, data: troca };
  }

  async updateStatus(id: string, dto: UpdateTrocaStatusDto) {
    const troca = await this.prisma.troca.findUnique({ where: { id } });
    if (!troca) throw new NotFoundException('Troca não encontrada');

    const updated = await this.prisma.troca.update({
      where: { id },
      data: { status: dto.status as any },
    });

    if (dto.status === TrocaStatus.FINALIZADA || dto.status === TrocaStatus.CANCELADA) {
      const pendentes = await this.prisma.troca.count({
        where: { vendaId: troca.vendaId, status: TrocaStatus.PENDENTE },
      });
      if (pendentes === 0) {
        await this.prisma.venda.update({
          where: { id: troca.vendaId },
          data: { status: VendaStatus.FINALIZADA },
        });
      }
    }

    this.logger.log(`Troca ${id} atualizada para ${dto.status}`);
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const troca = await this.prisma.troca.findUnique({ where: { id } });
    if (!troca) throw new NotFoundException('Troca não encontrada');

    await this.prisma.troca.delete({ where: { id } });
    return { success: true, message: 'Troca removida com sucesso' };
  }
}
