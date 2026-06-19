import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SyncCompraDto } from './dto/sync-compra.dto';

@Injectable()
export class ComprasService {
  private readonly logger = new Logger(ComprasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sincronizar(dto: SyncCompraDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const existing = await this.prisma.compraHistorico.findUnique({ where: { vendaId: dto.vendaId } });
    if (existing) throw new ConflictException('Compra já sincronizada');

    const compra = await this.prisma.compraHistorico.create({
      data: {
        clienteId: dto.clienteId,
        companyId: dto.companyId,
        vendaId: dto.vendaId,
        numero: dto.numero,
        dataHora: new Date(dto.dataHora),
        subtotal: dto.subtotal,
        desconto: dto.desconto ?? 0,
        acrescimo: dto.acrescimo ?? 0,
        total: dto.total,
        tipo: dto.tipo ?? 'PDV',
        status: dto.status ?? 'FINALIZADA',
        itens: dto.itens ?? [],
        pagamentos: dto.pagamentos ?? [],
      },
    });

    await this.prisma.cliente.update({
      where: { id: dto.clienteId },
      data: {
        totalCompras: cliente.totalCompras.toNumber() + dto.total,
        ultimaCompra: new Date(dto.dataHora),
      },
    });

    return compra;
  }

  async listar(clienteId: string, pagina = 1, limite = 10) {
    const skip = (pagina - 1) * limite;
    const [data, total] = await Promise.all([
      this.prisma.compraHistorico.findMany({
        where: { clienteId },
        orderBy: { dataHora: 'desc' },
        skip,
        take: limite,
      }),
      this.prisma.compraHistorico.count({ where: { clienteId } }),
    ]);
    return { data, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async ultimas(clienteId: string, n = 5) {
    return this.prisma.compraHistorico.findMany({
      where: { clienteId },
      orderBy: { dataHora: 'desc' },
      take: n,
    });
  }

  async detalhe(clienteId: string, vendaId: string) {
    const compra = await this.prisma.compraHistorico.findFirst({
      where: { clienteId, vendaId },
    });
    if (!compra) throw new NotFoundException('Compra não encontrada');
    return compra;
  }

  async resumo(clienteId: string) {
    const compras = await this.prisma.compraHistorico.findMany({ where: { clienteId } });
    if (compras.length === 0) {
      return { totalGasto: 0, totalCompras: 0, ticketMedio: 0, primeiraCompra: null, ultimaCompra: null };
    }

    const totalGasto = compras.reduce((s, c) => s + c.total.toNumber(), 0);
    const dataOrdered = [...compras].sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());

    return {
      totalGasto,
      totalCompras: compras.length,
      ticketMedio: totalGasto / compras.length,
      primeiraCompra: dataOrdered[0].dataHora,
      ultimaCompra: dataOrdered[dataOrdered.length - 1].dataHora,
    };
  }
}
