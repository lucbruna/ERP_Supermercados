import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DisplayService {
  private readonly logger = new Logger(DisplayService.name);

  constructor(private prisma: PrismaService) {}

  async getVendaDisplay(vendaId: string) {
    const venda = await this.prisma.venda.findUnique({
      where: { id: vendaId },
      include: { itensVenda: true, pagamentosVenda: true, pdv: true },
    });
    if (!venda) throw new NotFoundException('Venda não encontrada');

    const itens = venda.itensVenda.map((item) => ({
      descricao: item.descricao,
      quantidade: Number(item.quantidade),
      unidade: item.unidade,
      precoUnitario: Number(item.precoUnitario),
      precoTotal: Number(item.precoTotal),
      desconto: Number(item.desconto),
    }));

    const pagamentos = venda.pagamentosVenda.map((pag) => ({
      tipo: pag.tipo,
      valor: Number(pag.valor),
      parcelas: pag.parcelas,
      troco: pag.troco ? Number(pag.troco) : undefined,
    }));

    const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    const troco = totalPago > Number(venda.total) ? totalPago - Number(venda.total) : 0;

    return {
      success: true,
      data: {
        vendaId: venda.id,
        numero: venda.numero,
        pdv: venda.pdv.codigo,
        dataHora: venda.dataHora,
        status: venda.status,
        itens,
        totalItens: itens.length,
        subtotal: Number(venda.subtotal),
        desconto: Number(venda.desconto),
        acrescimo: Number(venda.acrescimo),
        total: Number(venda.total),
        pagamentos,
        totalPago,
        troco,
      },
    };
  }
}
