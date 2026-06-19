import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { GerarCobrancaDto, RegistrarAcaoCobrancaDto, NegociarCobrancaDto, BaixarCobrancaDto } from './dto/gerar-cobranca.dto';

@Injectable()
export class CobrancaService {
  private readonly logger = new Logger(CobrancaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async gerar(dto: GerarCobrancaDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    return this.prisma.cobranca.create({
      data: {
        clienteId: dto.clienteId,
        companyId: dto.companyId,
        vendaId: dto.vendaId,
        documento: dto.documento,
        valorOriginal: dto.valorOriginal,
        valorAtual: dto.valorOriginal,
        dataVencimento: new Date(dto.dataVencimento),
        juros: dto.juros,
        multa: dto.multa,
        observacao: dto.observacao,
      },
    });
  }

  async listar(clienteId: string) {
    return this.prisma.cobranca.findMany({
      where: { clienteId },
      orderBy: { dataVencimento: 'desc' },
    });
  }

  async historico(cobrancaId: string) {
    const cobranca = await this.prisma.cobranca.findUnique({ where: { id: cobrancaId } });
    if (!cobranca) throw new NotFoundException('Cobrança não encontrada');

    const acoes = await this.prisma.historicoCobranca.findMany({
      where: { cobrancaId },
      orderBy: { data: 'desc' },
    });

    return { cobranca, acoes };
  }

  async registrarAcao(dto: RegistrarAcaoCobrancaDto) {
    const cobranca = await this.prisma.cobranca.findUnique({ where: { id: dto.cobrancaId } });
    if (!cobranca) throw new NotFoundException('Cobrança não encontrada');

    return this.prisma.historicoCobranca.create({
      data: {
        cobrancaId: dto.cobrancaId,
        tipo: dto.tipo as any,
        descricao: dto.descricao,
        resultado: dto.resultado,
      },
    });
  }

  async negociar(id: string, dto: NegociarCobrancaDto) {
    const cobranca = await this.prisma.cobranca.findUnique({ where: { id } });
    if (!cobranca) throw new NotFoundException('Cobrança não encontrada');

    await this.prisma.cobranca.update({
      where: { id },
      data: {
        valorAtual: dto.novoValor,
        dataVencimento: new Date(dto.novoVencimento),
        status: 'RENEGOCIADA',
        observacao: dto.observacao,
      },
    });

    return this.prisma.historicoCobranca.create({
      data: {
        cobrancaId: id,
        tipo: 'NEGOCIACAO',
        descricao: `Renegociado: novo valor R$ ${dto.novoValor}, vencimento ${dto.novoVencimento}${dto.parcelas ? `, ${dto.parcelas}x` : ''}`,
      },
    });
  }

  async baixar(id: string, dto: BaixarCobrancaDto) {
    const cobranca = await this.prisma.cobranca.findUnique({ where: { id } });
    if (!cobranca) throw new NotFoundException('Cobrança não encontrada');

    await this.prisma.cobranca.update({
      where: { id },
      data: {
        status: 'PAGA',
        dataPagamento: new Date(dto.dataPagamento),
        valorAtual: dto.valorPago ?? cobranca.valorAtual,
      },
    });

    return this.prisma.historicoCobranca.create({
      data: {
        cobrancaId: id,
        tipo: 'EMAIL',
        descricao: `Baixada como paga em ${dto.dataPagamento}${dto.observacao ? `: ${dto.observacao}` : ''}`,
      },
    });
  }

  async relatorioInadimplencia(companyId: string) {
    const cobrancas = await this.prisma.cobranca.findMany({
      where: { companyId, status: { in: ['PENDENTE', 'VENCIDA'] } },
      include: { cliente: { select: { id: true, nome: true, cpfCnpj: true } } },
    });

    const total = cobrancas.reduce((s, c) => s + c.valorAtual.toNumber(), 0);
    return { totalInadimplentes: cobrancas.length, valorTotal: total, cobrancas };
  }

  async relatorioAging(companyId: string) {
    const cobrancas = await this.prisma.cobranca.findMany({
      where: { companyId, status: { in: ['PENDENTE', 'VENCIDA'] } },
    });

    const faixas = { ate30: 0, ate60: 0, ate90: 0, ate120: 0, acima120: 0 };
    const valores = { ate30: 0, ate60: 0, ate90: 0, ate120: 0, acima120: 0 };

    const hoje = new Date();
    for (const c of cobrancas) {
      const atraso = Math.floor((hoje.getTime() - c.dataVencimento.getTime()) / (1000 * 60 * 60 * 24));
      if (atraso <= 30) { faixas.ate30++; valores.ate30 += c.valorAtual.toNumber(); }
      else if (atraso <= 60) { faixas.ate60++; valores.ate60 += c.valorAtual.toNumber(); }
      else if (atraso <= 90) { faixas.ate90++; valores.ate90 += c.valorAtual.toNumber(); }
      else if (atraso <= 120) { faixas.ate120++; valores.ate120 += c.valorAtual.toNumber(); }
      else { faixas.acima120++; valores.acima120 += c.valorAtual.toNumber(); }
    }

    return { faixas, valores, total: cobrancas.length };
  }

  async negativar(id: string) {
    const cobranca = await this.prisma.cobranca.findUnique({ where: { id } });
    if (!cobranca) throw new NotFoundException('Cobrança não encontrada');

    await this.prisma.cobranca.update({ where: { id }, data: { status: 'VENCIDA' } });
    return this.prisma.historicoCobranca.create({
      data: {
        cobrancaId: id,
        tipo: 'EMAIL',
        descricao: 'Cliente negativado',
      },
    });
  }
}
