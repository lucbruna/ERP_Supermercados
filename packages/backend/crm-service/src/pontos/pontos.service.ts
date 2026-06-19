import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreditarPontosDto } from './dto/creditar-pontos.dto';
import { DebitarPontosDto } from './dto/debitar-pontos.dto';

@Injectable()
export class PontosService {
  private readonly logger = new Logger(PontosService.name);

  constructor(private readonly prisma: PrismaService) {}

  async creditar(dto: CreditarPontosDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    if (!cliente.ativo) throw new BadRequestException('Cliente inativo');

    const saldoAnterior = cliente.pontos;
    const saldoAtual = saldoAnterior + dto.pontos;

    const [transacao] = await this.prisma.$transaction([
      this.prisma.pontuacaoTransacao.create({
        data: {
          clienteId: dto.clienteId,
          vendaId: dto.vendaId,
          tipo: 'CREDITO',
          pontos: dto.pontos,
          saldoAnterior,
          saldoAtual,
          descricao: dto.descricao,
        },
      }),
      this.prisma.cliente.update({
        where: { id: dto.clienteId },
        data: { pontos: saldoAtual },
      }),
    ]);

    return transacao;
  }

  async debitar(dto: DebitarPontosDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    if (!cliente.ativo) throw new BadRequestException('Cliente inativo');

    const saldoAnterior = cliente.pontos;
    if (saldoAnterior < dto.pontos) {
      throw new BadRequestException('Saldo de pontos insuficiente');
    }
    const saldoAtual = saldoAnterior - dto.pontos;

    const [transacao] = await this.prisma.$transaction([
      this.prisma.pontuacaoTransacao.create({
        data: {
          clienteId: dto.clienteId,
          tipo: 'DEBITO',
          pontos: dto.pontos,
          saldoAnterior,
          saldoAtual,
          descricao: dto.descricao,
        },
      }),
      this.prisma.cliente.update({
        where: { id: dto.clienteId },
        data: { pontos: saldoAtual },
      }),
    ]);

    return transacao;
  }

  async extrato(clienteId: string, pagina = 1, limite = 20) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const skip = (pagina - 1) * limite;
    const [data, total] = await Promise.all([
      this.prisma.pontuacaoTransacao.findMany({
        where: { clienteId },
        orderBy: { data: 'desc' },
        skip,
        take: limite,
      }),
      this.prisma.pontuacaoTransacao.count({ where: { clienteId } }),
    ]);

    return {
      data,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
      saldoAtual: cliente.pontos,
    };
  }
}
