import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProdutoDto, UpdateProdutoDto, ProdutoQueryDto } from './dto/create-produto.dto';

@Injectable()
export class ProdutosService {
  private readonly logger = new Logger(ProdutosService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProdutoDto) {
    const [codigoExists, barcodeExists] = await Promise.all([
      this.prisma.produto.findUnique({ where: { companyId_codigo: { companyId: dto.companyId, codigo: dto.codigo } } }),
      this.prisma.produto.findUnique({ where: { companyId_codigoBarras: { companyId: dto.companyId, codigoBarras: dto.codigoBarras } } }),
    ]);

    if (codigoExists) throw new ConflictException('Código do produto já cadastrado');
    if (barcodeExists) throw new ConflictException('Código de barras já cadastrado');

    const produto = await this.prisma.produto.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        codigo: dto.codigo,
        codigoBarras: dto.codigoBarras,
        codigoBarrasSecundario: dto.codigoBarrasSecundario,
        descricao: dto.descricao,
        descricaoReduzida: dto.descricaoReduzida,
        marca: dto.marca,
        fabricante: dto.fabricante,
        unidadeMedida: dto.unidadeMedida,
        ncm: dto.ncm,
        cest: dto.cest,
        cfop: dto.cfop,
        origem: dto.origem,
        precoCusto: dto.precoCusto,
        precoVenda: dto.precoVenda,
        precoPromocional: dto.precoPromocional,
        lucroPercentual: dto.lucroPercentual,
        estoqueMinimo: dto.estoqueMinimo,
        estoqueMaximo: dto.estoqueMaximo,
        estoqueAtual: dto.estoqueAtual ?? 0,
        estoqueReservado: dto.estoqueReservado ?? 0,
        fracionado: dto.fracionado ?? false,
        pesavel: dto.pesavel ?? false,
        validadeDias: dto.validadeDias,
        loteControlado: dto.loteControlado ?? false,
        ativo: dto.ativo ?? true,
        imagemUrl: dto.imagemUrl,
        categoriaId: dto.categoriaId,
      },
      include: { categoria: true },
    });

    this.logger.log(`Produto criado: ${produto.descricao} (${produto.codigo})`);
    return { success: true, data: produto };
  }

  async findAll(companyId: string, query: ProdutoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.search) {
      where.OR = [
        { descricao: { contains: query.search, mode: 'insensitive' } },
        { codigo: { contains: query.search } },
        { codigoBarras: { contains: query.search } },
        { marca: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.categoriaId) where.categoriaId = query.categoriaId;
    if (query.marca) where.marca = { contains: query.marca, mode: 'insensitive' };
    if (query.ativo !== undefined) where.ativo = query.ativo;
    if (query.estoqueBaixo) {
      where.estoqueAtual = { lte: this.prisma.produto.fields.estoqueMinimo };
    }

    const [data, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { descricao: 'asc' },
        include: { categoria: true },
      }),
      this.prisma.produto.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        lotes: { where: { quantidadeAtual: { gt: 0 } }, orderBy: { dataValidade: 'asc' } },
      },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return { success: true, data: produto };
  }

  async findByBarcode(codigo: string) {
    const produto = await this.prisma.produto.findFirst({
      where: {
        OR: [
          { codigoBarras: codigo },
          { codigoBarrasSecundario: codigo },
        ],
      },
      include: { categoria: true },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado para o código de barras informado');
    return { success: true, data: produto };
  }

  async update(id: string, dto: UpdateProdutoDto) {
    await this.findOne(id);
    const updated = await this.prisma.produto.update({
      where: { id },
      data: dto,
      include: { categoria: true },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });
    return { success: true, message: 'Produto desativado com sucesso' };
  }
}
