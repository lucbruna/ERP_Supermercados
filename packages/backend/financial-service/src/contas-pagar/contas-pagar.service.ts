import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContaPagarDto, UpdateContaPagarDto, QueryContaPagarDto, BaixaContaPagarDto } from './dto/create-conta-pagar.dto';
import { StatusConta } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContasPagarService {
  private readonly logger = new Logger(ContasPagarService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContaPagarDto) {
    const conta = await this.prisma.contaPagar.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        fornecedorId: dto.fornecedorId,
        documento: dto.documento,
        parcela: dto.parcela || 1,
        emitente: dto.emitente,
        descricao: dto.descricao,
        valorNominal: new Prisma.Decimal(dto.valorNominal),
        dataEmissao: new Date(dto.dataEmissao),
        dataVencimento: new Date(dto.dataVencimento),
        dataPagamento: dto.dataPagamento ? new Date(dto.dataPagamento) : null,
        juros: dto.juros ? new Prisma.Decimal(dto.juros) : null,
        multa: dto.multa ? new Prisma.Decimal(dto.multa) : null,
        desconto: dto.desconto ? new Prisma.Decimal(dto.desconto) : null,
        categoria: dto.categoria,
        centroCusto: dto.centroCusto,
        formaPagamento: dto.formaPagamento,
        status: dto.status || StatusConta.PENDENTE,
        observacao: dto.observacao,
        anexos: dto.anexos || [],
      },
    });
    return { success: true, data: conta };
  }

  async findAll(query: QueryContaPagarDto) {
    const pagina = query.pagina || 1;
    const limite = query.limite || 50;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    if (query.fornecedorId) where.fornecedorId = query.fornecedorId;
    if (query.status) where.status = query.status;
    if (query.categoria) where.categoria = query.categoria;
    if (query.centroCusto) where.centroCusto = query.centroCusto;
    if (query.dataVencimentoInicio || query.dataVencimentoFim) {
      where.dataVencimento = {};
      if (query.dataVencimentoInicio) where.dataVencimento.gte = new Date(query.dataVencimentoInicio);
      if (query.dataVencimentoFim) where.dataVencimento.lte = new Date(query.dataVencimentoFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.contaPagar.findMany({
        where,
        skip,
        take: limite,
        orderBy: { dataVencimento: 'asc' },
      }),
      this.prisma.contaPagar.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
    };
  }

  async findOne(id: string) {
    const conta = await this.prisma.contaPagar.findUnique({ where: { id } });
    if (!conta) throw new NotFoundException('Conta a pagar não encontrada');
    return { success: true, data: conta };
  }

  async update(id: string, dto: UpdateContaPagarDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.unidadeId) data.unidadeId = dto.unidadeId;
    if (dto.documento) data.documento = dto.documento;
    if (dto.parcela) data.parcela = dto.parcela;
    if (dto.emitente) data.emitente = dto.emitente;
    if (dto.descricao) data.descricao = dto.descricao;
    if (dto.valorNominal) data.valorNominal = new Prisma.Decimal(dto.valorNominal);
    if (dto.valorPago) data.valorPago = new Prisma.Decimal(dto.valorPago);
    if (dto.dataEmissao) data.dataEmissao = new Date(dto.dataEmissao);
    if (dto.dataVencimento) data.dataVencimento = new Date(dto.dataVencimento);
    if (dto.dataPagamento) data.dataPagamento = new Date(dto.dataPagamento);
    if (dto.juros) data.juros = new Prisma.Decimal(dto.juros);
    if (dto.multa) data.multa = new Prisma.Decimal(dto.multa);
    if (dto.desconto) data.desconto = new Prisma.Decimal(dto.desconto);
    if (dto.categoria) data.categoria = dto.categoria;
    if (dto.centroCusto) data.centroCusto = dto.centroCusto;
    if (dto.formaPagamento) data.formaPagamento = dto.formaPagamento;
    if (dto.status) data.status = dto.status;
    if (dto.observacao) data.observacao = dto.observacao;
    if (dto.anexos) data.anexos = dto.anexos;

    const conta = await this.prisma.contaPagar.update({ where: { id }, data });
    return { success: true, data: conta };
  }

  async darBaixa(id: string, dto: BaixaContaPagarDto) {
    const conta = await this.prisma.contaPagar.findUnique({ where: { id } });
    if (!conta) throw new NotFoundException('Conta a pagar não encontrada');
    if (conta.status === StatusConta.PAGA) {
      throw new BadRequestException('Conta já está paga');
    }
    if (conta.status === StatusConta.CANCELADA) {
      throw new BadRequestException('Conta cancelada não pode receber baixa');
    }

    const updated = await this.prisma.contaPagar.update({
      where: { id },
      data: {
        status: StatusConta.PAGA,
        valorPago: new Prisma.Decimal(dto.valorPago),
        dataPagamento: new Date(dto.dataPagamento),
        juros: dto.juros ? new Prisma.Decimal(dto.juros) : null,
        multa: dto.multa ? new Prisma.Decimal(dto.multa) : null,
        desconto: dto.desconto ? new Prisma.Decimal(dto.desconto) : null,
        observacao: dto.observacao,
      },
    });

    await this.registrarLancamentoCaixa(updated);

    return { success: true, data: updated };
  }

  async cancelar(id: string) {
    await this.findOne(id);
    const conta = await this.prisma.contaPagar.update({
      where: { id },
      data: { status: StatusConta.CANCELADA },
    });
    return { success: true, data: conta };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contaPagar.delete({ where: { id } });
    return { success: true, message: 'Conta a pagar removida com sucesso' };
  }

  private async registrarLancamentoCaixa(conta: any) {
    await this.prisma.lancamentoCaixa.create({
      data: {
        companyId: conta.companyId,
        unidadeId: conta.unidadeId,
        tipo: 'SAIDA',
        categoria: conta.categoria,
        descricao: `Pagamento: ${conta.descricao} - ${conta.documento}`,
        valor: conta.valorPago || conta.valorNominal,
        formaPagamento: conta.formaPagamento,
        dataHora: new Date(),
        operadorId: 'system',
        origem: 'CONTAS_PAGAR',
        conciliado: false,
      },
    });
  }
}
