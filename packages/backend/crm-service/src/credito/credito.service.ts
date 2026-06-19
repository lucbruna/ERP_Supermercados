import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { DefinirLimiteDto, PagarCreditoDto } from './dto/definir-limite.dto';

@Injectable()
export class CreditoService {
  private readonly logger = new Logger(CreditoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async definirLimite(dto: DefinirLimiteDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const existing = await this.prisma.creditoCliente.findUnique({
      where: { clienteId_companyId: { clienteId: dto.clienteId, companyId: dto.companyId } },
    });

    if (existing) {
      return this.prisma.creditoCliente.update({
        where: { id: existing.id },
        data: { limite: dto.limite, observacao: dto.observacao, dataRenovacao: new Date() },
      });
    }

    return this.prisma.creditoCliente.create({
      data: {
        clienteId: dto.clienteId,
        companyId: dto.companyId,
        limite: dto.limite,
        saldoDevedor: 0,
        observacao: dto.observacao,
      },
    });
  }

  async obterCredito(clienteId: string) {
    const credito = await this.prisma.creditoCliente.findFirst({
      where: { clienteId },
      include: { cliente: { select: { id: true, nome: true, cpfCnpj: true } } },
    });
    if (!credito) throw new NotFoundException('Crédito não encontrado para este cliente');
    return {
      ...credito,
      saldoDisponivel: credito.limite.toNumber() - credito.saldoDevedor.toNumber(),
    };
  }

  async extrato(clienteId: string, pagina = 1, limite = 10) {
    const skip = (pagina - 1) * limite;
    const [data, total] = await Promise.all([
      this.prisma.transacaoCredito.findMany({
        where: { clienteId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limite,
      }),
      this.prisma.transacaoCredito.count({ where: { clienteId } }),
    ]);
    return { data, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async pagar(dto: PagarCreditoDto) {
    const credito = await this.prisma.creditoCliente.findFirst({
      where: { clienteId: dto.clienteId },
    });
    if (!credito) throw new NotFoundException('Crédito não encontrado');
    if (credito.status !== 'ATIVO') throw new BadRequestException('Crédito bloqueado ou cancelado');

    const novoSaldo = credito.saldoDevedor.toNumber() - dto.valor;
    if (novoSaldo < 0) throw new BadRequestException('Valor do pagamento excede o saldo devedor');

    await this.prisma.transacaoCredito.create({
      data: {
        clienteId: dto.clienteId,
        creditoId: credito.id,
        tipo: 'PAGAMENTO',
        valor: dto.valor,
        saldoDevedorAnterior: credito.saldoDevedor,
        saldoDevedorAtual: novoSaldo,
        descricao: dto.descricao || 'Pagamento de crédito',
        dataPagamento: new Date(),
      },
    });

    return this.prisma.creditoCliente.update({
      where: { id: credito.id },
      data: { saldoDevedor: novoSaldo },
    });
  }

  async bloquear(clienteId: string) {
    const credito = await this.prisma.creditoCliente.findFirst({ where: { clienteId } });
    if (!credito) throw new NotFoundException('Crédito não encontrado');
    return this.prisma.creditoCliente.update({
      where: { id: credito.id },
      data: { status: 'BLOQUEADO' },
    });
  }

  async relatorio(companyId: string) {
    const creditos = await this.prisma.creditoCliente.findMany({
      where: { companyId },
      include: { cliente: { select: { id: true, nome: true, cpfCnpj: true } } },
    });

    const totalLimite = creditos.reduce((s, c) => s + c.limite.toNumber(), 0);
    const totalDevedor = creditos.reduce((s, c) => s + c.saldoDevedor.toNumber(), 0);

    return {
      totalClientes: creditos.length,
      totalLimite,
      totalDevedor,
      totalDisponivel: totalLimite - totalDevedor,
      inadimplentes: creditos.filter(c => c.saldoDevedor.toNumber() >= c.limite.toNumber() * 0.8).length,
      clientes: creditos,
    };
  }

  async analisar(clienteId: string) {
    const credito = await this.prisma.creditoCliente.findFirst({ where: { clienteId } });
    if (!credito) throw new NotFoundException('Crédito não encontrado');

    const transacoes = await this.prisma.transacaoCredito.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const pagtosEmDia = transacoes.filter(t => t.tipo === 'PAGAMENTO' && t.dataPagamento).length;
    const totalPagtos = transacoes.filter(t => t.tipo === 'PAGAMENTO').length;

    return {
      score: totalPagtos > 0 ? Math.round((pagtosEmDia / totalPagtos) * 100) : 0,
      totalTransacoes: transacoes.length,
      totalPagtos,
      pagtosEmDia,
      utilizacao: credito.limite.toNumber() > 0
        ? Math.round((credito.saldoDevedor.toNumber() / credito.limite.toNumber()) * 100)
        : 0,
      credito,
    };
  }
}
