import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContaReceberDto, UpdateContaReceberDto, QueryContaReceberDto, ReceberContaDto } from './dto/create-conta-receber.dto';
import { StatusConta } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContasReceberService {
  private readonly logger = new Logger(ContasReceberService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContaReceberDto) {
    const conta = await this.prisma.contaReceber.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        clienteId: dto.clienteId,
        vendaId: dto.vendaId,
        documento: dto.documento,
        parcela: dto.parcela || 1,
        emitente: dto.emitente,
        descricao: dto.descricao,
        valorNominal: new Prisma.Decimal(dto.valorNominal),
        dataEmissao: new Date(dto.dataEmissao),
        dataVencimento: new Date(dto.dataVencimento),
        dataRecebimento: dto.dataRecebimento ? new Date(dto.dataRecebimento) : null,
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

  async findAll(query: QueryContaReceberDto) {
    const pagina = query.pagina || 1;
    const limite = query.limite || 50;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    if (query.clienteId) where.clienteId = query.clienteId;
    if (query.status) where.status = query.status;
    if (query.categoria) where.categoria = query.categoria;
    if (query.dataVencimentoInicio || query.dataVencimentoFim) {
      where.dataVencimento = {};
      if (query.dataVencimentoInicio) where.dataVencimento.gte = new Date(query.dataVencimentoInicio);
      if (query.dataVencimentoFim) where.dataVencimento.lte = new Date(query.dataVencimentoFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.contaReceber.findMany({
        where,
        skip,
        take: limite,
        orderBy: { dataVencimento: 'asc' },
      }),
      this.prisma.contaReceber.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
    };
  }

  async findOne(id: string) {
    const conta = await this.prisma.contaReceber.findUnique({ where: { id } });
    if (!conta) throw new NotFoundException('Conta a receber não encontrada');
    return { success: true, data: conta };
  }

  async update(id: string, dto: UpdateContaReceberDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.unidadeId) data.unidadeId = dto.unidadeId;
    if (dto.clienteId) data.clienteId = dto.clienteId;
    if (dto.vendaId) data.vendaId = dto.vendaId;
    if (dto.documento) data.documento = dto.documento;
    if (dto.parcela) data.parcela = dto.parcela;
    if (dto.emitente) data.emitente = dto.emitente;
    if (dto.descricao) data.descricao = dto.descricao;
    if (dto.valorNominal) data.valorNominal = new Prisma.Decimal(dto.valorNominal);
    if (dto.valorRecebido) data.valorRecebido = new Prisma.Decimal(dto.valorRecebido);
    if (dto.dataEmissao) data.dataEmissao = new Date(dto.dataEmissao);
    if (dto.dataVencimento) data.dataVencimento = new Date(dto.dataVencimento);
    if (dto.dataRecebimento) data.dataRecebimento = new Date(dto.dataRecebimento);
    if (dto.juros) data.juros = new Prisma.Decimal(dto.juros);
    if (dto.multa) data.multa = new Prisma.Decimal(dto.multa);
    if (dto.desconto) data.desconto = new Prisma.Decimal(dto.desconto);
    if (dto.categoria) data.categoria = dto.categoria;
    if (dto.centroCusto) data.centroCusto = dto.centroCusto;
    if (dto.formaPagamento) data.formaPagamento = dto.formaPagamento;
    if (dto.status) data.status = dto.status;
    if (dto.observacao) data.observacao = dto.observacao;
    if (dto.anexos) data.anexos = dto.anexos;

    const conta = await this.prisma.contaReceber.update({ where: { id }, data });
    return { success: true, data: conta };
  }

  async receber(id: string, dto: ReceberContaDto) {
    const conta = await this.prisma.contaReceber.findUnique({ where: { id } });
    if (!conta) throw new NotFoundException('Conta a receber não encontrada');
    if (conta.status === StatusConta.PAGA) {
      throw new BadRequestException('Conta já está recebida');
    }
    if (conta.status === StatusConta.CANCELADA) {
      throw new BadRequestException('Conta cancelada não pode ser recebida');
    }

    const updated = await this.prisma.contaReceber.update({
      where: { id },
      data: {
        status: StatusConta.PAGA,
        valorRecebido: new Prisma.Decimal(dto.valorRecebido),
        dataRecebimento: new Date(dto.dataRecebimento),
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
    const conta = await this.prisma.contaReceber.update({
      where: { id },
      data: { status: StatusConta.CANCELADA },
    });
    return { success: true, data: conta };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contaReceber.delete({ where: { id } });
    return { success: true, message: 'Conta a receber removida com sucesso' };
  }

  private async registrarLancamentoCaixa(conta: any) {
    await this.prisma.lancamentoCaixa.create({
      data: {
        companyId: conta.companyId,
        unidadeId: conta.unidadeId,
        tipo: 'ENTRADA',
        categoria: conta.categoria,
        descricao: `Recebimento: ${conta.descricao} - ${conta.documento}`,
        valor: conta.valorRecebido || conta.valorNominal,
        formaPagamento: conta.formaPagamento,
        dataHora: new Date(),
        operadorId: 'system',
        origem: 'CONTAS_RECEBER',
        conciliado: false,
      },
    });
  }
}
