import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateInventarioDto, RealizarContagemDto, FecharInventarioDto, InventarioQueryDto } from './dto/create-inventario.dto';

@Injectable()
export class InventarioService {
  private readonly logger = new Logger(InventarioService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInventarioDto) {
    const inventario = await this.prisma.inventario.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        tipo: dto.tipo,
        setor: dto.setor,
        dataInicio: new Date(dto.dataInicio),
        responsavelId: dto.responsavelId,
        status: 'ABERTO',
        itens: [],
        divergencias: 0,
      },
    });

    this.logger.log(`Inventário criado: ${inventario.id} tipo=${dto.tipo}`);
    return { success: true, data: inventario };
  }

  async findAll(companyId: string, query: InventarioQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.status) where.status = query.status;
    if (query.tipo) where.tipo = query.tipo;

    const [data, total] = await Promise.all([
      this.prisma.inventario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventario.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const inventario = await this.prisma.inventario.findUnique({ where: { id } });
    if (!inventario) throw new NotFoundException('Inventário não encontrado');
    return { success: true, data: inventario };
  }

  async realizarContagem(id: string, dto: RealizarContagemDto) {
    const inventario = await this.prisma.inventario.findUnique({ where: { id } });
    if (!inventario) throw new NotFoundException('Inventário não encontrado');
    if (inventario.status === 'FECHADO' || inventario.status === 'AJUSTADO') {
      throw new BadRequestException('Inventário já foi fechado ou ajustado');
    }

    const divergencias = dto.itens.filter(
      item => item.quantidadeSistema !== item.quantidadeContada,
    ).length;

    const updated = await this.prisma.inventario.update({
      where: { id },
      data: {
        itens: dto.itens as any,
        divergencias,
        status: 'EM_ANDAMENTO',
      },
    });

    this.logger.log(`Contagem registrada para inventário ${id}: ${divergencias} divergências`);
    return { success: true, data: updated };
  }

  async fechar(id: string, dto: FecharInventarioDto) {
    const inventario = await this.prisma.inventario.findUnique({ where: { id } });
    if (!inventario) throw new NotFoundException('Inventário não encontrado');
    if (inventario.status === 'FECHADO' || inventario.status === 'AJUSTADO') {
      throw new BadRequestException('Inventário já foi fechado ou ajustado');
    }

    const updated = await this.prisma.inventario.update({
      where: { id },
      data: {
        status: 'FECHADO',
        dataFim: new Date(),
        aprovadoPor: dto.aprovadoPor,
      },
    });

    this.logger.log(`Inventário ${id} fechado`);
    return { success: true, data: updated };
  }

  async ajustar(id: string) {
    const inventario = await this.prisma.inventario.findUnique({ where: { id } });
    if (!inventario) throw new NotFoundException('Inventário não encontrado');
    if (inventario.status !== 'FECHADO') {
      throw new BadRequestException('Inventário precisa estar fechado para ajustar estoque');
    }

    const itens = inventario.itens as any[];
    const movimentos: any[] = [];

    for (const item of itens) {
      const diferenca = item.quantidadeContada - item.quantidadeSistema;
      if (diferenca === 0) continue;

      const produto = await this.prisma.produto.findUnique({ where: { id: item.produtoId } });
      if (!produto) continue;

      const saldoAnterior = Number(produto.estoqueAtual);
      const saldoAtual = saldoAnterior + diferenca;

      movimentos.push(
        this.prisma.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            unidadeId: inventario.unidadeId,
            tipo: 'INVENTARIO',
            quantidade: Math.abs(diferenca),
            saldoAnterior,
            saldoAtual,
            observacao: `Ajuste inventário ${id}: ${diferenca > 0 ? 'sobra' : 'falta'} de ${Math.abs(diferenca)}`,
            usuarioId: inventario.responsavelId,
            data: new Date(),
          },
        }),
        this.prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: saldoAtual },
        }),
      );
    }

    await this.prisma.$transaction([
      ...movimentos,
      this.prisma.inventario.update({
        where: { id },
        data: { status: 'AJUSTADO' },
      }),
    ]);

    this.logger.log(`Inventário ${id} ajustado - ${itens.length} itens processados`);
    return { success: true, message: `Inventário ajustado com sucesso. ${itens.length} itens processados.` };
  }
}
