import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidarCupomDto, AplicarCupomDto, CreateCupomDto, CupomQueryDto } from './dto/cupom.dto';

@Injectable()
export class CuponsService {
  private readonly logger = new Logger(CuponsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCupomDto) {
    const existing = await this.prisma.cupom.findUnique({ where: { codigo: dto.codigo } });
    if (existing) throw new BadRequestException('Cupom já existe');

    const cupom = await this.prisma.cupom.create({
      data: {
        codigo: dto.codigo,
        tipo: dto.tipo as any,
        valor: dto.valor,
        valorMinimo: dto.valorMinimo,
        produtosIds: dto.produtosIds || [],
        usoLimite: dto.usoLimite || 1,
        dataValidade: dto.dataValidade,
        ativo: dto.ativo ?? true,
      },
    });

    this.logger.log(`Cupom criado: ${cupom.codigo}`);
    return { success: true, data: cupom };
  }

  async findAll(query: CupomQueryDto) {
    const where: any = {};
    if (query.search) where.codigo = { contains: query.search, mode: 'insensitive' };
    if (query.ativo !== undefined) where.ativo = query.ativo;

    const cupons = await this.prisma.cupom.findMany({ where, orderBy: { criadoEm: 'desc' } });
    return { success: true, data: cupons };
  }

  async findOne(id: string) {
    const cupom = await this.prisma.cupom.findUnique({ where: { id } });
    if (!cupom) throw new NotFoundException('Cupom não encontrado');
    return { success: true, data: cupom };
  }

  async remove(id: string) {
    const cupom = await this.prisma.cupom.findUnique({ where: { id } });
    if (!cupom) throw new NotFoundException('Cupom não encontrado');
    await this.prisma.cupom.delete({ where: { id } });
    return { success: true, message: 'Cupom removido com sucesso' };
  }

  async validar(dto: ValidarCupomDto) {
    const cupom = await this.prisma.cupom.findUnique({ where: { codigo: dto.codigo } });
    if (!cupom) throw new NotFoundException('Cupom não encontrado');
    if (!cupom.ativo) throw new BadRequestException('Cupom inativo');
    if (cupom.dataValidade && new Date(cupom.dataValidade) < new Date()) {
      throw new BadRequestException('Cupom expirado');
    }
    if (cupom.usosAtuais >= cupom.usoLimite) {
      throw new BadRequestException('Cupom atingiu limite de usos');
    }
    if (cupom.valorMinimo && dto.valorTotal && dto.valorTotal < Number(cupom.valorMinimo)) {
      throw new BadRequestException(`Valor mínimo de R$ ${cupom.valorMinimo} não atingido`);
    }

    const produtosIds = cupom.produtosIds as string[];
    if (produtosIds.length > 0 && dto.produtosIds) {
      const temProduto = dto.produtosIds.some((id) => produtosIds.includes(id));
      if (!temProduto) throw new BadRequestException('Cupom não aplicável aos produtos');
    }

    let valorDesconto = 0;
    if (cupom.tipo === 'PERCENTUAL') {
      valorDesconto = (dto.valorTotal || 0) * (Number(cupom.valor) / 100);
    } else {
      valorDesconto = Number(cupom.valor);
    }

    return {
      success: true,
      data: {
        cupom,
        valorDesconto: Math.min(valorDesconto, dto.valorTotal || 0),
        valido: true,
      },
    };
  }

  async aplicar(dto: AplicarCupomDto) {
    const venda = await this.prisma.venda.findUnique({ where: { id: dto.vendaId } });
    if (!venda) throw new NotFoundException('Venda não encontrada');

    const cupom = await this.prisma.cupom.findUnique({ where: { codigo: dto.codigo } });
    if (!cupom) throw new NotFoundException('Cupom não encontrado');
    if (!cupom.ativo) throw new BadRequestException('Cupom inativo');
    if (cupom.dataValidade && new Date(cupom.dataValidade) < new Date()) {
      throw new BadRequestException('Cupom expirado');
    }
    if (cupom.usosAtuais >= cupom.usoLimite) {
      throw new BadRequestException('Cupom atingiu limite de usos');
    }

    let valorDesconto = 0;
    if (cupom.tipo === 'PERCENTUAL') {
      valorDesconto = Number(venda.subtotal) * (Number(cupom.valor) / 100);
    } else {
      valorDesconto = Number(cupom.valor);
    }
    valorDesconto = Math.min(valorDesconto, Number(venda.subtotal));

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.cupom.update({
        where: { id: cupom.id },
        data: { usosAtuais: { increment: 1 } },
      });

      await tx.cupomUso.create({
        data: {
          cupomId: cupom.id,
          vendaId: venda.id,
          clienteId: dto.clienteId,
          valorDesconto,
        },
      });

      const novoTotal = Number(venda.total) - valorDesconto;
      return tx.venda.update({
        where: { id: venda.id },
        data: {
          cupomId: cupom.id,
          descontoTotal: valorDesconto,
          total: novoTotal < 0 ? 0 : novoTotal,
        },
      });
    });

    this.logger.log(`Cupom ${cupom.codigo} aplicado à venda ${venda.numero}: -R$ ${valorDesconto}`);
    return { success: true, data: { venda: updated, desconto: valorDesconto, cupom: cupom.codigo } };
  }
}
