import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RegistrarPesoDto, PesoQueryDto } from './dto/balanca.dto';

@Injectable()
export class BalancaService {
  private readonly logger = new Logger(BalancaService.name);
  constructor(private readonly prisma: PrismaService) {}

  async registrarPeso(dto: RegistrarPesoDto) {
    return this.prisma.pesoRegistrado.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        balancaId: dto.balancaId,
        produtoId: dto.produtoId,
        peso: dto.peso,
        unidade: dto.unidade ?? 'KG',
        lote: dto.lote,
      },
    });
  }

  async listarPesos(query: PesoQueryDto) {
    const { pagina = 1, limite = 10, balancaId, produtoId } = query;
    const where: any = {};
    if (balancaId) where.balancaId = balancaId;
    if (produtoId) where.produtoId = produtoId;
    const [data, total] = await Promise.all([
      this.prisma.pesoRegistrado.findMany({ where, orderBy: { dataHora: 'desc' }, take: limite, skip: (pagina - 1) * limite }),
      this.prisma.pesoRegistrado.count({ where }),
    ]);
    return { data, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async ultimoPeso(balancaId: string) {
    return this.prisma.pesoRegistrado.findFirst({ where: { balancaId }, orderBy: { dataHora: 'desc' } });
  }
}
