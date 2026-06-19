import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { QueryAvaliacaoDto } from './dto/query-avaliacao.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class AvaliacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvaliacaoDto) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id: dto.fornecedorId },
    });
    if (!fornecedor) throw new NotFoundException('Fornecedor não encontrado');

    return this.prisma.avaliacaoFornecedor.create({
      data: {
        ...dto,
        data: new Date(dto.data),
      } as any,
    });
  }

  async findAll(query: QueryAvaliacaoDto) {
    const { fornecedorId, avaliadorId, pagina = 1, limite = 10 } = query;
    const where: any = {};

    if (fornecedorId) where.fornecedorId = fornecedorId;
    if (avaliadorId) where.avaliadorId = avaliadorId;

    const total = await this.prisma.avaliacaoFornecedor.count({ where });
    const data = await this.prisma.avaliacaoFornecedor.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { createdAt: 'desc' },
      include: { Fornecedor: true },
    });

    return paginate(data, total, pagina, limite);
  }

  async findOne(id: string) {
    const record = await this.prisma.avaliacaoFornecedor.findUnique({
      where: { id },
      include: { Fornecedor: true },
    });
    if (!record) throw new NotFoundException('Avaliação não encontrada');
    return record;
  }

  async findByFornecedor(fornecedorId: string) {
    return this.prisma.avaliacaoFornecedor.findMany({
      where: { fornecedorId },
      orderBy: { data: 'desc' },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.avaliacaoFornecedor.delete({ where: { id } });
  }
}
