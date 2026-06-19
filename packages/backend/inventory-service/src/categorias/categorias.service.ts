import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCategoriaDto, UpdateCategoriaDto, CategoriaQueryDto } from './dto/create-categoria.dto';

@Injectable()
export class CategoriasService {
  private readonly logger = new Logger(CategoriasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoriaDto) {
    const categoria = await this.prisma.categoriaProduto.create({
      data: {
        companyId: dto.companyId,
        nome: dto.nome,
        departamento: dto.departamento,
        percentualMargem: dto.percentualMargem,
        ativo: dto.ativo ?? true,
      },
    });
    this.logger.log(`Categoria criada: ${categoria.nome}`);
    return { success: true, data: categoria };
  }

  async findAll(companyId: string, query: CategoriaQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.search) {
      where.OR = [
        { nome: { contains: query.search, mode: 'insensitive' } },
        { departamento: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.departamento) where.departamento = query.departamento;

    const [data, total] = await Promise.all([
      this.prisma.categoriaProduto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
        include: { _count: { select: { produtos: true } } },
      }),
      this.prisma.categoriaProduto.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoriaProduto.findUnique({
      where: { id },
      include: { _count: { select: { produtos: true } } },
    });
    if (!categoria) throw new NotFoundException('Categoria não encontrada');
    return { success: true, data: categoria };
  }

  async update(id: string, dto: UpdateCategoriaDto) {
    await this.findOne(id);
    const updated = await this.prisma.categoriaProduto.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.categoriaProduto.update({
      where: { id },
      data: { ativo: false },
    });
    return { success: true, message: 'Categoria desativada com sucesso' };
  }
}
