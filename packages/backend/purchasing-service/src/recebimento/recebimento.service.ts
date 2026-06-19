import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRecebimentoDto } from './dto/create-recebimento.dto';
import { QueryRecebimentoDto } from './dto/query-recebimento.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class RecebimentoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRecebimentoDto) {
    const pedido = await this.prisma.pedidoCompra.findUnique({
      where: { id: dto.pedidoCompraId },
    });
    if (!pedido) throw new NotFoundException('Pedido de compra não encontrado');
    if (!['ENVIADO', 'PARCIAL'].includes(pedido.status)) {
      throw new BadRequestException('Pedido não está em status de recebimento');
    }

    const recebimento = await this.prisma.recebimentoMercadoria.create({
      data: {
        ...dto,
        dataRecebimento: new Date(dto.dataRecebimento),
      } as any,
    });

    const todosItensOk = dto.itens.every(
      (item: any) => item.quantidadeRecebida >= item.quantidade,
    );

    await this.prisma.pedidoCompra.update({
      where: { id: dto.pedidoCompraId },
      data: {
        dataEntregaReal: new Date(dto.dataRecebimento),
        status: todosItensOk ? 'RECEBIDO' : 'PARCIAL',
        recebimento: { dataRecebimento: dto.dataRecebimento, itens: dto.itens } as any,
      } as any,
    });

    return recebimento;
  }

  async findAll(query: QueryRecebimentoDto) {
    const { pedidoCompraId, conferenteId, dataInicio, dataFim, pagina = 1, limite = 10 } = query;
    const where: any = {};

    if (pedidoCompraId) where.pedidoCompraId = pedidoCompraId;
    if (conferenteId) where.conferenteId = conferenteId;
    if (dataInicio || dataFim) {
      where.dataRecebimento = {};
      if (dataInicio) where.dataRecebimento.gte = new Date(dataInicio);
      if (dataFim) where.dataRecebimento.lte = new Date(dataFim);
    }

    const total = await this.prisma.recebimentoMercadoria.count({ where });
    const data = await this.prisma.recebimentoMercadoria.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { createdAt: 'desc' },
      include: { PedidoCompra: true },
    });

    return paginate(data, total, pagina, limite);
  }

  async findOne(id: string) {
    const record = await this.prisma.recebimentoMercadoria.findUnique({
      where: { id },
      include: { PedidoCompra: true },
    });
    if (!record) throw new NotFoundException('Recebimento não encontrado');
    return record;
  }

  async remove(id: string) {
    const record = await this.findOne(id);
    return this.prisma.recebimentoMercadoria.delete({ where: { id } });
  }
}
