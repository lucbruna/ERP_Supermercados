import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCategoriaDto, UpdateCategoriaDto, QueryCategoriaDto } from './dto/categoria.dto';

@Injectable()
export class CategoriasService {
  private readonly logger = new Logger(CategoriasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoriaDto) {
    const existing = await this.prisma.categoriaFinanceira.findUnique({
      where: { companyId_nome_centroCusto: { companyId: dto.companyId, nome: dto.nome, centroCusto: dto.centroCusto } },
    });
    if (existing) {
      throw new ConflictException('Categoria já existe para esta empresa/centro de custo');
    }

    const categoria = await this.prisma.categoriaFinanceira.create({
      data: {
        companyId: dto.companyId,
        nome: dto.nome,
        tipo: dto.tipo,
        centroCusto: dto.centroCusto,
        ativo: dto.ativo ?? true,
      },
    });
    return { success: true, data: categoria };
  }

  async findAll(query: QueryCategoriaDto) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.centroCusto) where.centroCusto = query.centroCusto;

    const data = await this.prisma.categoriaFinanceira.findMany({
      where,
      orderBy: [{ centroCusto: 'asc' }, { nome: 'asc' }],
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoriaFinanceira.findUnique({ where: { id } });
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    return { success: true, data: categoria };
  }

  async update(id: string, dto: UpdateCategoriaDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.nome) data.nome = dto.nome;
    if (dto.tipo) data.tipo = dto.tipo;
    if (dto.centroCusto) data.centroCusto = dto.centroCusto;
    if (dto.ativo !== undefined) data.ativo = dto.ativo;

    const categoria = await this.prisma.categoriaFinanceira.update({ where: { id }, data });
    return { success: true, data: categoria };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.categoriaFinanceira.update({
      where: { id },
      data: { ativo: false },
    });
    return { success: true, message: 'Categoria desativada com sucesso' };
  }
}
