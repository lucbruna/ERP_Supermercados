import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreditarCashbackDto } from './dto/creditar-cashback.dto';
import { DebitarCashbackDto } from './dto/debitar-cashback.dto';

@Injectable()
export class CashbackService {
  private readonly logger = new Logger(CashbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async creditar(dto: CreditarCashbackDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    if (!cliente.ativo) throw new BadRequestException('Cliente inativo');

    const saldoAnterior = Number(cliente.cashbackDisponivel);
    const saldoAtual = saldoAnterior + dto.valor;

    const [transacao] = await this.prisma.$transaction([
      this.prisma.cashbackTransacao.create({
        data: {
          clienteId: dto.clienteId,
          vendaId: dto.vendaId,
          tipo: 'CREDITO',
          valor: dto.valor,
          saldoAnterior,
          saldoAtual,
          descricao: dto.descricao,
        },
      }),
      this.prisma.cliente.update({
        where: { id: dto.clienteId },
        data: {
          cashbackDisponivel: saldoAtual,
          cashbackRecebido: { increment: dto.valor },
        },
      }),
    ]);

    return transacao;
  }

  async debitar(dto: DebitarCashbackDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    if (!cliente.ativo) throw new BadRequestException('Cliente inativo');

    const saldoAnterior = Number(cliente.cashbackDisponivel);
    if (saldoAnterior < dto.valor) {
      throw new BadRequestException('Saldo de cashback insuficiente');
    }
    const saldoAtual = saldoAnterior - dto.valor;

    const [transacao] = await this.prisma.$transaction([
      this.prisma.cashbackTransacao.create({
        data: {
          clienteId: dto.clienteId,
          tipo: 'DEBITO',
          valor: dto.valor,
          saldoAnterior,
          saldoAtual,
          descricao: dto.descricao,
        },
      }),
      this.prisma.cliente.update({
        where: { id: dto.clienteId },
        data: { cashbackDisponivel: saldoAtual },
      }),
    ]);

    return transacao;
  }

  async extrato(clienteId: string, pagina = 1, limite = 20) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const skip = (pagina - 1) * limite;
    const [data, total] = await Promise.all([
      this.prisma.cashbackTransacao.findMany({
        where: { clienteId },
        orderBy: { data: 'desc' },
        skip,
        take: limite,
      }),
      this.prisma.cashbackTransacao.count({ where: { clienteId } }),
    ]);

    return {
      data,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
      saldoAtual: Number(cliente.cashbackDisponivel),
    };
  }
}
