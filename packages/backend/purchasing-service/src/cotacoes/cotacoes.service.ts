import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCotacaoDto } from './dto/create-cotacao.dto';
import { UpdateCotacaoDto } from './dto/update-cotacao.dto';
import { QueryCotacaoDto } from './dto/query-cotacao.dto';
import { SelecionarVencedorDto } from './dto/selecionar-vencedor.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class CotacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCotacaoDto) {
    return this.prisma.cotacao.create({ data: dto as any });
  }

  async findAll(query: QueryCotacaoDto) {
    const { companyId, unidadeId, status, dataInicio, dataFim, pagina = 1, limite = 10 } = query;
    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (unidadeId) where.unidadeId = unidadeId;
    if (status) where.status = status;
    if (dataInicio || dataFim) {
      where.dataAbertura = {};
      if (dataInicio) where.dataAbertura.gte = new Date(dataInicio);
      if (dataFim) where.dataAbertura.lte = new Date(dataFim);
    }

    const total = await this.prisma.cotacao.count({ where });
    const data = await this.prisma.cotacao.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { createdAt: 'desc' },
    });

    return paginate(data, total, pagina, limite);
  }

  async findOne(id: string) {
    const record = await this.prisma.cotacao.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Cotação não encontrada');
    return record;
  }

  async update(id: string, dto: UpdateCotacaoDto) {
    await this.findOne(id);
    return this.prisma.cotacao.update({ where: { id }, data: dto as any });
  }

  async abrir(id: string) {
    const cotacao = await this.findOne(id);
    if (cotacao.status !== 'ABERTA') {
      throw new BadRequestException('Cotação já está aberta ou não pode ser aberta');
    }
    return this.prisma.cotacao.update({
      where: { id },
      data: { status: 'ABERTA', dataAbertura: new Date() },
    });
  }

  async fechar(id: string) {
    const cotacao = await this.findOne(id);
    if (cotacao.status !== 'ABERTA') {
      throw new BadRequestException('Apenas cotações abertas podem ser fechadas');
    }
    return this.prisma.cotacao.update({
      where: { id },
      data: { status: 'FECHADA', dataFechamento: new Date() },
    });
  }

  async selecionarVencedor(id: string, dto: SelecionarVencedorDto) {
    const cotacao = await this.findOne(id);
    if (cotacao.status !== 'FECHADA') {
      throw new BadRequestException('Apenas cotações fechadas podem ter vencedor selecionado');
    }
    return this.prisma.cotacao.update({
      where: { id },
      data: {
        status: 'APROVADA',
        aprovadoPor: dto.aprovadoPor,
      },
    });
  }

  async remove(id: string) {
    const cotacao = await this.findOne(id);
    if (cotacao.status !== 'ABERTA') {
      throw new BadRequestException('Apenas cotações abertas podem ser removidas');
    }
    return this.prisma.cotacao.update({
      where: { id },
      data: { status: 'CANCELADA' },
    });
  }
}
