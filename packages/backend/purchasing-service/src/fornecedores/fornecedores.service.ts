import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { QueryFornecedorDto } from './dto/query-fornecedor.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFornecedorDto) {
    return this.prisma.fornecedor.create({ data: dto as any });
  }

  async findAll(query: QueryFornecedorDto) {
    const { search, companyId, cnpj, ativo, pagina = 1, limite = 10 } = query;
    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (cnpj) where.cnpj = cnpj;
    if (ativo !== undefined) where.ativo = ativo;

    if (search) {
      where.OR = [
        { razaoSocial: { contains: search, mode: 'insensitive' } },
        { nomeFantasia: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.fornecedor.count({ where });
    const data = await this.prisma.fornecedor.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(data, total, pagina, limite);
  }

  async findOne(id: string) {
    const record = await this.prisma.fornecedor.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Fornecedor não encontrado');
    return record;
  }

  async update(id: string, dto: UpdateFornecedorDto) {
    await this.findOne(id);
    return this.prisma.fornecedor.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.fornecedor.update({ where: { id }, data: { ativo: false } });
  }
}
