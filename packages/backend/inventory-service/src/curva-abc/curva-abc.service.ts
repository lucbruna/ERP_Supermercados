import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AbcCalculatorService } from '../services/abc-calculator.service';
import { CalcularCurvaAbcDto, CurvaAbcQueryDto } from './dto/create-curva-abc.dto';

@Injectable()
export class CurvaAbcService {
  private readonly logger = new Logger(CurvaAbcService.name);

  constructor(
    private prisma: PrismaService,
    private abcCalculator: AbcCalculatorService,
  ) {}

  async calcular(dto: CalcularCurvaAbcDto) {
    const resultados = await this.abcCalculator.calcular(dto.unidadeId, dto.mes, dto.ano);

    await this.prisma.curvaABC.deleteMany({
      where: { unidadeId: dto.unidadeId, mes: dto.mes, ano: dto.ano },
    });

    if (resultados.length > 0) {
      await this.prisma.curvaABC.createMany({ data: resultados as any });
    }

    this.logger.log(`Curva ABC calculada para ${dto.mes}/${dto.ano}: ${resultados.length} produtos`);
    return { success: true, data: resultados };
  }

  async findAll(unidadeId: string, query: CurvaAbcQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { unidadeId };
    if (query.mes) where.mes = query.mes;
    if (query.ano) where.ano = query.ano;

    const [data, total] = await Promise.all([
      this.prisma.curvaABC.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ ano: 'desc' }, { mes: 'desc' }, { percentualFaturamento: 'desc' }],
        include: { produto: { select: { id: true, descricao: true, codigo: true } } },
      }),
      this.prisma.curvaABC.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const registro = await this.prisma.curvaABC.findUnique({
      where: { id },
      include: { produto: { select: { id: true, descricao: true, codigo: true, precoVenda: true } } },
    });
    if (!registro) throw new NotFoundException('Registro de curva ABC não encontrado');
    return { success: true, data: registro };
  }
}
