import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePixDto, UpdatePixDto, QueryPixDto } from './dto/pix.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PixService {
  private readonly logger = new Logger(PixService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePixDto) {
    const transacao = await this.prisma.pix.create({
      data: {
        companyId: dto.companyId,
        contaBancariaId: dto.contaBancariaId,
        tipo: dto.tipo,
        chavePix: dto.chavePix,
        valor: new Prisma.Decimal(dto.valor),
        descricao: dto.descricao,
        status: dto.status || 'PENDENTE',
        txid: dto.txid,
        qrCodeUrl: dto.qrCodeUrl,
        copiaCola: dto.copiaCola,
        dataTransacao: new Date(dto.dataTransacao),
      },
    });
    return { success: true, data: transacao };
  }

  async findAll(query: QueryPixDto) {
    const pagina = query.pagina || 1;
    const limite = query.limite || 50;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.contaBancariaId) where.contaBancariaId = query.contaBancariaId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.status) where.status = query.status;
    if (query.dataInicio || query.dataFim) {
      where.dataTransacao = {};
      if (query.dataInicio) where.dataTransacao.gte = new Date(query.dataInicio);
      if (query.dataFim) where.dataTransacao.lte = new Date(query.dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.pix.findMany({
        where,
        skip,
        take: limite,
        orderBy: { dataTransacao: 'desc' },
        include: { contaBancaria: { select: { banco: true, conta: true } } },
      }),
      this.prisma.pix.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
    };
  }

  async findOne(id: string) {
    const transacao = await this.prisma.pix.findUnique({
      where: { id },
      include: { contaBancaria: true },
    });
    if (!transacao) throw new NotFoundException('Transação PIX não encontrada');
    return { success: true, data: transacao };
  }

  async update(id: string, dto: UpdatePixDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.status) data.status = dto.status;
    if (dto.txid) data.txid = dto.txid;
    if (dto.qrCodeUrl) data.qrCodeUrl = dto.qrCodeUrl;
    if (dto.copiaCola) data.copiaCola = dto.copiaCola;

    const transacao = await this.prisma.pix.update({ where: { id }, data });
    return { success: true, data: transacao };
  }

  async confirmar(id: string) {
    await this.findOne(id);
    const transacao = await this.prisma.pix.update({
      where: { id },
      data: { status: 'CONCLUIDO' },
    });

    const valor = Number(transacao.valor);
    const tipoMovimento = transacao.tipo === 'COBRANCA' ? 'ENTRADA' : transacao.tipo === 'ENVIO' ? 'SAIDA' : null;

    if (tipoMovimento) {
      await this.prisma.lancamentoCaixa.create({
        data: {
          companyId: transacao.companyId,
          unidadeId: transacao.companyId,
          tipo: tipoMovimento,
          categoria: 'PIX',
          descricao: `PIX ${transacao.tipo}: ${transacao.descricao || transacao.chavePix}`,
          valor: new Prisma.Decimal(valor),
          formaPagamento: 'PIX',
          dataHora: new Date(),
          operadorId: 'system',
          origem: 'PIX',
          conciliado: true,
        },
      });

      const increment = tipoMovimento === 'ENTRADA' ? valor : -valor;
      await this.prisma.contaBancaria.update({
        where: { id: transacao.contaBancariaId },
        data: {
          saldoAtual: { increment },
          saldoDisponivel: { increment },
        },
      });
    }

    return { success: true, data: transacao };
  }

  async estornar(id: string) {
    const transacao = await this.prisma.pix.findUnique({ where: { id } });
    if (!transacao) throw new NotFoundException('Transação PIX não encontrada');

    const estorno = await this.prisma.pix.create({
      data: {
        companyId: transacao.companyId,
        contaBancariaId: transacao.contaBancariaId,
        tipo: 'ESTORNO',
        chavePix: transacao.chavePix,
        valor: transacao.valor,
        descricao: `Estorno: ${transacao.descricao || transacao.id}`,
        status: 'CONCLUIDO',
        dataTransacao: new Date(),
      },
    });

    await this.prisma.pix.update({
      where: { id },
      data: { status: 'ESTORNADO' },
    });

    const valor = Number(transacao.valor);
    const increment = transacao.tipo === 'COBRANCA' ? -valor : valor;

    await this.prisma.contaBancaria.update({
      where: { id: transacao.contaBancariaId },
      data: {
        saldoAtual: { increment },
        saldoDisponivel: { increment },
      },
    });

    return { success: true, data: estorno };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.pix.delete({ where: { id } });
    return { success: true, message: 'Transação PIX removida com sucesso' };
  }
}
