import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StockValidatorService } from '../services/stock-validator.service';
import { GerarSugestoesDto, SugestaoCompraQueryDto } from './dto/create-sugestao-compra.dto';

@Injectable()
export class SugestaoCompraService {
  private readonly logger = new Logger(SugestaoCompraService.name);

  constructor(
    private prisma: PrismaService,
    private stockValidator: StockValidatorService,
  ) {}

  async gerar(dto: GerarSugestoesDto) {
    const alertas = await this.stockValidator.gerarAlertasEstoque(dto.unidadeId);

    const sugestoes = alertas
      .filter(a => a.tipo === 'ESTOQUE_CRITICO' || a.tipo === 'ESTOQUE_BAIXO')
      .map(a => ({
        produtoId: a.produtoId,
        unidadeId: dto.unidadeId,
        estoqueAtual: a.estoqueAtual,
        estoqueMinimo: a.estoqueMinimo,
        consumoMedio: a.consumoMedio,
        quantidadeSugerida: Math.max(
          a.estoqueMaximo - a.estoqueAtual,
          a.consumoMedio * 30 - a.estoqueAtual,
        ),
        data: new Date(),
        processada: false,
      }));

    if (sugestoes.length > 0) {
      await this.prisma.sugestaoCompra.createMany({ data: sugestoes });
    }

    this.logger.log(`${sugestoes.length} sugestões de compra geradas`);
    return { success: true, data: sugestoes };
  }

  async findAll(unidadeId: string, query: SugestaoCompraQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { unidadeId };
    if (query.processada !== undefined) where.processada = query.processada;

    const [data, total] = await Promise.all([
      this.prisma.sugestaoCompra.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: { produto: { select: { id: true, descricao: true, codigo: true, unidadeMedida: true } } },
      }),
      this.prisma.sugestaoCompra.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const sugestao = await this.prisma.sugestaoCompra.findUnique({
      where: { id },
      include: { produto: { select: { id: true, descricao: true, codigo: true, precoCusto: true, unidadeMedida: true } } },
    });
    if (!sugestao) throw new NotFoundException('Sugestão de compra não encontrada');
    return { success: true, data: sugestao };
  }

  async processar(id: string) {
    const sugestao = await this.prisma.sugestaoCompra.findUnique({ where: { id } });
    if (!sugestao) throw new NotFoundException('Sugestão de compra não encontrada');

    const updated = await this.prisma.sugestaoCompra.update({
      where: { id },
      data: { processada: true },
    });

    return { success: true, data: updated };
  }
}
