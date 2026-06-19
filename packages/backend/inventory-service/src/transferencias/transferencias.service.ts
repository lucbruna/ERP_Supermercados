import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTransferenciaDto, TransferenciaQueryDto } from './dto/create-transferencia.dto';

@Injectable()
export class TransferenciasService {
  private readonly logger = new Logger(TransferenciasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransferenciaDto) {
    const transferencia = await this.prisma.transferenciaEstoque.create({
      data: {
        companyId: dto.companyId,
        origemUnidadeId: dto.origemUnidadeId,
        destinoUnidadeId: dto.destinoUnidadeId,
        responsavelOrigemId: dto.responsavelOrigemId,
        itens: dto.itens as any,
        status: 'PENDENTE',
      },
    });

    this.logger.log(`Transferência criada: ${transferencia.id}`);
    return { success: true, data: transferencia };
  }

  async findAll(companyId: string, query: TransferenciaQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.transferenciaEstoque.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transferenciaEstoque.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const transferencia = await this.prisma.transferenciaEstoque.findUnique({ where: { id } });
    if (!transferencia) throw new NotFoundException('Transferência não encontrada');
    return { success: true, data: transferencia };
  }

  async expedir(id: string) {
    const transferencia = await this.prisma.transferenciaEstoque.findUnique({ where: { id } });
    if (!transferencia) throw new NotFoundException('Transferência não encontrada');
    if (transferencia.status !== 'PENDENTE') {
      throw new BadRequestException('Apenas transferências pendentes podem ser expedidas');
    }

    const itens = transferencia.itens as any[];

    await this.prisma.$transaction(async (tx) => {
      for (const item of itens) {
        const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });
        if (!produto) throw new NotFoundException(`Produto ${item.codigo} não encontrado`);
        if (Number(produto.estoqueAtual) < item.quantidade) {
          throw new BadRequestException(`Estoque insuficiente para ${produto.descricao}. Disponível: ${produto.estoqueAtual}`);
        }

        const saldoAnterior = Number(produto.estoqueAtual);
        const saldoAtual = saldoAnterior - item.quantidade;

        await tx.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            unidadeId: transferencia.origemUnidadeId,
            tipo: 'TRANSFERENCIA',
            quantidade: item.quantidade,
            saldoAnterior,
            saldoAtual,
            documento: `TRF-${id}`,
            lote: item.lote,
            observacao: `Transferência para unidade ${transferencia.destinoUnidadeId}`,
            usuarioId: transferencia.responsavelOrigemId,
            data: new Date(),
          },
        });

        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: saldoAtual },
        });
      }

      await tx.transferenciaEstoque.update({
        where: { id },
        data: { status: 'EXPEDIDA', dataExpedicao: new Date() },
      });
    });

    const updated = await this.prisma.transferenciaEstoque.findUnique({ where: { id } });
    this.logger.log(`Transferência ${id} expedida`);
    return { success: true, data: updated };
  }

  async receber(id: string, responsavelDestinoId: string) {
    const transferencia = await this.prisma.transferenciaEstoque.findUnique({ where: { id } });
    if (!transferencia) throw new NotFoundException('Transferência não encontrada');
    if (transferencia.status !== 'EXPEDIDA') {
      throw new BadRequestException('Apenas transferências expedidas podem ser recebidas');
    }

    const itens = transferencia.itens as any[];

    await this.prisma.$transaction(async (tx) => {
      for (const item of itens) {
        const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });
        if (!produto) continue;

        const saldoAnterior = Number(produto.estoqueAtual);
        const saldoAtual = saldoAnterior + item.quantidade;

        await tx.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            unidadeId: transferencia.destinoUnidadeId,
            tipo: 'TRANSFERENCIA',
            quantidade: item.quantidade,
            saldoAnterior,
            saldoAtual,
            documento: `TRF-${id}`,
            lote: item.lote,
            observacao: `Recebimento de transferência da unidade ${transferencia.origemUnidadeId}`,
            usuarioId: responsavelDestinoId,
            data: new Date(),
          },
        });

        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: saldoAtual },
        });
      }

      await tx.transferenciaEstoque.update({
        where: { id },
        data: {
          status: 'RECEBIDA',
          dataRecebimento: new Date(),
          responsavelDestinoId,
        },
      });
    });

    const updated = await this.prisma.transferenciaEstoque.findUnique({ where: { id } });
    this.logger.log(`Transferência ${id} recebida`);
    return { success: true, data: updated };
  }

  async cancelar(id: string) {
    const transferencia = await this.prisma.transferenciaEstoque.findUnique({ where: { id } });
    if (!transferencia) throw new NotFoundException('Transferência não encontrada');
    if (transferencia.status === 'RECEBIDA' || transferencia.status === 'CANCELADA') {
      throw new BadRequestException('Transferência já foi recebida ou cancelada');
    }

    const updated = await this.prisma.transferenciaEstoque.update({
      where: { id },
      data: { status: 'CANCELADA' },
    });

    this.logger.log(`Transferência ${id} cancelada`);
    return { success: true, data: updated };
  }
}
