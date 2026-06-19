import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { GerarPrevisaoDto, PrevisaoQueryDto } from '../dto/previsao.dto';
import { PrevisaoVendasService } from '../services/previsao-vendas.service';

@Injectable()
export class PrevisoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly previsaoVendas: PrevisaoVendasService,
  ) {}

  async generate(dto: GerarPrevisaoDto) {
    const result = await this.previsaoVendas.forecast(dto.produtoId, new Date(dto.data), dto.fatores);
    return this.prisma.previsaoVenda.create({ data: result });
  }

  async findAll(query: PrevisaoQueryDto) {
    const where: any = {};
    if (query.produtoId) where.produtoId = query.produtoId;
    if (query.dataInicio || query.dataFim) {
      where.data = {};
      if (query.dataInicio) where.data.gte = new Date(query.dataInicio);
      if (query.dataFim) where.data.lte = new Date(query.dataFim);
    }
    return this.prisma.previsaoVenda.findMany({
      where,
      orderBy: { data: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.previsaoVenda.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Forecast not found');
    return record;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.previsaoVenda.delete({ where: { id } });
  }
}
