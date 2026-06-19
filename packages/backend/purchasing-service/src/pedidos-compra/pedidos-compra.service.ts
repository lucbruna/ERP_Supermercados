import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePedidoCompraDto } from './dto/create-pedido-compra.dto';
import { CreateFromCotacaoDto } from './dto/create-from-cotacao.dto';
import { UpdatePedidoCompraDto } from './dto/update-pedido-compra.dto';
import { QueryPedidoCompraDto } from './dto/query-pedido-compra.dto';
import { AprovarPedidoDto } from './dto/aprovar-pedido.dto';
import { RejeitarPedidoDto } from './dto/rejeitar-pedido.dto';
import { ReceberPedidoDto } from './dto/receber-pedido.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class PedidosCompraService {
  constructor(private readonly prisma: PrismaService) {}

  private async gerarNumero(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.pedidoCompra.count({
      where: { companyId },
    });
    return `PO-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(dto: CreatePedidoCompraDto) {
    const numero = await this.gerarNumero(dto.companyId);
    return this.prisma.pedidoCompra.create({
      data: {
        ...dto,
        numero,
        status: 'RASCUNHO',
        aprovacaoHierarquica: [],
        dataPedido: new Date(dto.dataPedido),
        dataEntregaPrevista: new Date(dto.dataEntregaPrevista),
      } as any,
    });
  }

  async createFromCotacao(dto: CreateFromCotacaoDto) {
    const cotacao = await this.prisma.cotacao.findUnique({
      where: { id: dto.cotacaoId },
    });
    if (!cotacao) throw new NotFoundException('Cotação não encontrada');
    if (cotacao.status !== 'APROVADA') {
      throw new BadRequestException('Apenas cotações aprovadas podem gerar pedidos');
    }

    const fornecedor = cotacao.fornecedores[0] as any;
    const numero = await this.gerarNumero(cotacao.companyId);

    return this.prisma.pedidoCompra.create({
      data: {
        companyId: cotacao.companyId,
        unidadeId: dto.unidadeId,
        fornecedorId: fornecedor?.id || '',
        cotacaoId: cotacao.id,
        numero,
        itens: cotacao.itens,
        dataPedido: new Date(),
        dataEntregaPrevista: new Date(dto.dataEntregaPrevista),
        valorTotal: 0,
        frete: 0,
        desconto: 0,
        condicaoPagamento: '',
        status: 'RASCUNHO',
        aprovacaoHierarquica: [],
      } as any,
    });
  }

  async findAll(query: QueryPedidoCompraDto) {
    const { companyId, unidadeId, fornecedorId, status, numero, dataInicio, dataFim, pagina = 1, limite = 10 } = query;
    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (unidadeId) where.unidadeId = unidadeId;
    if (fornecedorId) where.fornecedorId = fornecedorId;
    if (status) where.status = status;
    if (numero) where.numero = { contains: numero };
    if (dataInicio || dataFim) {
      where.dataPedido = {};
      if (dataInicio) where.dataPedido.gte = new Date(dataInicio);
      if (dataFim) where.dataPedido.lte = new Date(dataFim);
    }

    const total = await this.prisma.pedidoCompra.count({ where });
    const data = await this.prisma.pedidoCompra.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { createdAt: 'desc' },
      include: { Fornecedor: true },
    });

    return paginate(data, total, pagina, limite);
  }

  async findOne(id: string) {
    const record = await this.prisma.pedidoCompra.findUnique({
      where: { id },
      include: { Fornecedor: true, recebimentos: true },
    });
    if (!record) throw new NotFoundException('Pedido de compra não encontrado');
    return record;
  }

  async update(id: string, dto: UpdatePedidoCompraDto) {
    await this.findOne(id);
    return this.prisma.pedidoCompra.update({ where: { id }, data: dto as any });
  }

  async enviarParaAprovacao(id: string) {
    const pedido = await this.findOne(id);
    if (pedido.status !== 'RASCUNHO') {
      throw new BadRequestException('Apenas pedidos em rascunho podem ser enviados para aprovação');
    }
    return this.prisma.pedidoCompra.update({
      where: { id },
      data: { status: 'AGUARDANDO_APROVACAO' },
    });
  }

  async aprovar(id: string, dto: AprovarPedidoDto) {
    const pedido = await this.findOne(id);
    if (pedido.status !== 'AGUARDANDO_APROVACAO') {
      throw new BadRequestException('Pedido não está aguardando aprovação');
    }

    const aprovacao = {
      usuarioId: dto.usuarioId,
      nivel: dto.nivel,
      data: new Date().toISOString(),
      status: 'APROVADO',
    };

    const aprovacoes = [...pedido.aprovacaoHierarquica, aprovacao];
    const novoStatus = aprovacoes.length >= 2 ? 'APROVADO' : 'AGUARDANDO_APROVACAO';

    return this.prisma.pedidoCompra.update({
      where: { id },
      data: {
        aprovacaoHierarquica: aprovacoes,
        status: novoStatus,
      } as any,
    });
  }

  async rejeitar(id: string, dto: RejeitarPedidoDto) {
    const pedido = await this.findOne(id);
    if (pedido.status !== 'AGUARDANDO_APROVACAO') {
      throw new BadRequestException('Pedido não está aguardando aprovação');
    }

    const aprovacao = {
      usuarioId: dto.usuarioId,
      data: new Date().toISOString(),
      status: 'REJEITADO',
      motivo: dto.motivo,
    };

    return this.prisma.pedidoCompra.update({
      where: { id },
      data: {
        aprovacaoHierarquica: [...pedido.aprovacaoHierarquica, aprovacao],
        status: 'RASCUNHO',
      } as any,
    });
  }

  async enviarParaFornecedor(id: string) {
    const pedido = await this.findOne(id);
    if (pedido.status !== 'APROVADO') {
      throw new BadRequestException('Apenas pedidos aprovados podem ser enviados ao fornecedor');
    }
    return this.prisma.pedidoCompra.update({
      where: { id },
      data: { status: 'ENVIADO' },
    });
  }

  async receberPedido(id: string, dto: ReceberPedidoDto) {
    const pedido = await this.findOne(id);
    if (!['ENVIADO', 'PARCIAL'].includes(pedido.status)) {
      throw new BadRequestException('Pedido não pode ser recebido no status atual');
    }

    const recebimento = {
      data: new Date(dto.dataEntregaReal).toISOString(),
      itensRecebidos: dto.itensRecebidos,
      observacao: dto.observacao,
    };

    const todosItensRecebidos = dto.itensRecebidos.every(
      (item: any) => item.quantidadeRecebida >= item.quantidade,
    );

    return this.prisma.pedidoCompra.update({
      where: { id },
      data: {
        dataEntregaReal: new Date(dto.dataEntregaReal),
        recebimento,
        status: todosItensRecebidos ? 'RECEBIDO' : 'PARCIAL',
      } as any,
    });
  }

  async cancelar(id: string) {
    const pedido = await this.findOne(id);
    const cancelaveis = ['RASCUNHO', 'AGUARDANDO_APROVACAO', 'APROVADO'];
    if (!cancelaveis.includes(pedido.status)) {
      throw new BadRequestException('Pedido não pode ser cancelado no status atual');
    }
    return this.prisma.pedidoCompra.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });
  }

  async remove(id: string) {
    return this.cancelar(id);
  }
}
