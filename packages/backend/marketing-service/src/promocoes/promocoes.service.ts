import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePromocaoDto, UpdatePromocaoDto, PromocaoQueryDto } from './dto/create-promocao.dto';

@Injectable()
export class PromocoesService {
  private readonly logger = new Logger(PromocoesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePromocaoDto) {
    const { produtos, ...promocaoData } = dto;

    const promocao = await this.prisma.promocao.create({
      data: {
        companyId: promocaoData.companyId,
        nome: promocaoData.nome,
        descricao: promocaoData.descricao,
        tipo: promocaoData.tipo,
        regras: promocaoData.regras || [],
        dataInicio: new Date(promocaoData.dataInicio),
        dataFim: new Date(promocaoData.dataFim),
        ativo: promocaoData.ativo ?? true,
        produtos: produtos
          ? {
              create: produtos.map((p) => ({
                produtoId: p.produtoId,
                precoPromocional: p.precoPromocional,
                quantidadeMaxima: p.quantidadeMaxima,
              })),
            }
          : undefined,
      },
      include: { produtos: true },
    });

    this.logger.log(`Promoção criada: ${promocao.nome}`);
    return { success: true, data: promocao };
  }

  async findAll(companyId: string, query: PromocaoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.search) {
      where.OR = [
        { nome: { contains: query.search, mode: 'insensitive' } },
        { descricao: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.tipo) where.tipo = query.tipo;
    if (query.ativo !== undefined) where.ativo = query.ativo;

    const [data, total] = await Promise.all([
      this.prisma.promocao.findMany({
        where,
        skip,
        take: limit,
        include: { produtos: true },
        orderBy: { dataInicio: 'desc' },
      }),
      this.prisma.promocao.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const promocao = await this.prisma.promocao.findUnique({
      where: { id },
      include: { produtos: true },
    });
    if (!promocao) throw new NotFoundException('Promoção não encontrada');
    return { success: true, data: promocao };
  }

  async update(id: string, dto: UpdatePromocaoDto) {
    await this.findOne(id);

    const { produtos, ...promocaoData } = dto;
    const data: any = { ...promocaoData };
    if (dto.dataInicio) data.dataInicio = new Date(dto.dataInicio);
    if (dto.dataFim) data.dataFim = new Date(dto.dataFim);

    if (produtos) {
      await this.prisma.promocaoProduto.deleteMany({ where: { promocaoId: id } });
      await this.prisma.promocaoProduto.createMany({
        data: produtos.map((p) => ({
          promocaoId: id,
          produtoId: p.produtoId,
          precoPromocional: p.precoPromocional,
          quantidadeMaxima: p.quantidadeMaxima,
        })),
      });
    }

    const updated = await this.prisma.promocao.update({
      where: { id },
      data,
      include: { produtos: true },
    });

    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.promocao.delete({ where: { id } });
    return { success: true, message: 'Promoção removida com sucesso' };
  }

  async ativar(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.promocao.update({
      where: { id },
      data: { ativo: true },
    });
    return { success: true, data: updated };
  }

  async desativar(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.promocao.update({
      where: { id },
      data: { ativo: false },
    });
    return { success: true, data: updated };
  }
}
