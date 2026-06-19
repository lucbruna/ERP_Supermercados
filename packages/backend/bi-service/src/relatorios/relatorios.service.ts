import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRelatorioDto, UpdateRelatorioDto, GerarRelatorioDto } from '../dto/relatorio.dto';
import { ReportGeneratorService } from '../services/report-generator.service';

@Injectable()
export class RelatoriosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: ReportGeneratorService,
  ) {}

  async create(dto: CreateRelatorioDto) {
    return this.prisma.relatorioBI.create({
      data: {
        companyId: dto.companyId,
        nome: dto.nome,
        tipo: dto.tipo || 'PERSONALIZADO',
        parametros: dto.parametros || {},
        dados: [],
        criadoPor: dto.criadoPor,
        agendado: dto.agendado || false,
        frequencia: dto.frequencia,
      },
    });
  }

  async findAll(companyId?: string, tipo?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (tipo) where.tipo = tipo;
    return this.prisma.relatorioBI.findMany({
      where,
      orderBy: { dataCriacao: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.relatorioBI.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Report not found');
    return record;
  }

  async update(id: string, dto: UpdateRelatorioDto) {
    await this.findOne(id);
    return this.prisma.relatorioBI.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.relatorioBI.delete({ where: { id } });
  }

  async generate(id: string, filtros?: string[]) {
    const relatorio = await this.findOne(id);
    const dados = await this.generator.generate(relatorio, filtros);
    return this.prisma.relatorioBI.update({
      where: { id },
      data: { dados, ultimaExecucao: new Date() },
    });
  }

  async generateFromDto(dto: GerarRelatorioDto) {
    const dados = await this.generator.generateFromFilters(dto.companyId, dto.parametros, dto.filtros);
    return dados;
  }
}
