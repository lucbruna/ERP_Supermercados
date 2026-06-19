import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTabelaPrecoDto } from './dto/create-tabela-preco.dto';
import { UpdateTabelaPrecoDto } from './dto/update-tabela-preco.dto';
import { QueryTabelaPrecoDto } from './dto/query-tabela-preco.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class TabelasPrecoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTabelaPrecoDto) {
    return this.prisma.tabelaPreco.create({
      data: {
        ...dto,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
      } as any,
    });
  }

  async findAll(query: QueryTabelaPrecoDto) {
    const { companyId, fornecedorId, nome, ativo, pagina = 1, limite = 10 } = query;
    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (fornecedorId) where.fornecedorId = fornecedorId;
    if (nome) where.nome = { contains: nome, mode: 'insensitive' };
    if (ativo !== undefined) where.ativo = ativo;

    const total = await this.prisma.tabelaPreco.count({ where });
    const data = await this.prisma.tabelaPreco.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { createdAt: 'desc' },
      include: { Fornecedor: true },
    });

    return paginate(data, total, pagina, limite);
  }

  async findOne(id: string) {
    const record = await this.prisma.tabelaPreco.findUnique({
      where: { id },
      include: { Fornecedor: true },
    });
    if (!record) throw new NotFoundException('Tabela de preço não encontrada');
    return record;
  }

  async findByFornecedor(fornecedorId: string) {
    return this.prisma.tabelaPreco.findMany({
      where: { fornecedorId, ativo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateTabelaPrecoDto) {
    await this.findOne(id);
    return this.prisma.tabelaPreco.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tabelaPreco.update({ where: { id }, data: { ativo: false } });
  }
}
