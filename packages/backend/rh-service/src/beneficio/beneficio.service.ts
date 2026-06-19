import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateBeneficioDto, UpdateBeneficioDto, BeneficioQueryDto, VincularBeneficioDto } from './dto/create-beneficio.dto';

@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBeneficioDto) {
    const beneficio = await this.prisma.beneficio.create({ data: dto });
    this.logger.log(`Benefício criado: ${beneficio.nome}`);
    return { success: true, data: beneficio };
  }

  async findAll(companyId: string, query: BeneficioQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.tipo) where.tipo = query.tipo;

    const [data, total] = await Promise.all([
      this.prisma.beneficio.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
        include: { _count: { select: { funcionarios: true } } },
      }),
      this.prisma.beneficio.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const beneficio = await this.prisma.beneficio.findUnique({
      where: { id },
      include: {
        funcionarios: {
          include: { funcionario: { select: { id: true, nome: true, matricula: true } } },
        },
      },
    });
    if (!beneficio) throw new NotFoundException('Benefício não encontrado');
    return { success: true, data: beneficio };
  }

  async update(id: string, dto: UpdateBeneficioDto) {
    await this.findOne(id);
    const updated = await this.prisma.beneficio.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.funcionarioBeneficio.deleteMany({ where: { beneficioId: id } });
    await this.prisma.beneficio.delete({ where: { id } });
    return { success: true, message: 'Benefício removido' };
  }

  async vincular(dto: VincularBeneficioDto) {
    const [funcionario, beneficio] = await Promise.all([
      this.prisma.funcionario.findUnique({ where: { id: dto.funcionarioId } }),
      this.prisma.beneficio.findUnique({ where: { id: dto.beneficioId } }),
    ]);
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');
    if (!beneficio) throw new NotFoundException('Benefício não encontrado');

    const existente = await this.prisma.funcionarioBeneficio.findUnique({
      where: {
        funcionarioId_beneficioId: {
          funcionarioId: dto.funcionarioId,
          beneficioId: dto.beneficioId,
        },
      },
    });
    if (existente) throw new ConflictException('Funcionário já possui este benefício');

    const vinculo = await this.prisma.funcionarioBeneficio.create({
      data: {
        funcionarioId: dto.funcionarioId,
        beneficioId: dto.beneficioId,
      },
      include: {
        funcionario: { select: { id: true, nome: true } },
        beneficio: true,
      },
    });

    return { success: true, data: vinculo };
  }

  async desvincular(funcionarioId: string, beneficioId: string) {
    const vinculo = await this.prisma.funcionarioBeneficio.findUnique({
      where: { funcionarioId_beneficioId: { funcionarioId, beneficioId } },
    });
    if (!vinculo) throw new NotFoundException('Vínculo não encontrado');

    await this.prisma.funcionarioBeneficio.delete({
      where: { funcionarioId_beneficioId: { funcionarioId, beneficioId } },
    });

    return { success: true, message: 'Benefício desvinculado do funcionário' };
  }

  async listarPorFuncionario(funcionarioId: string) {
    const beneficios = await this.prisma.funcionarioBeneficio.findMany({
      where: { funcionarioId, ativo: true },
      include: { beneficio: true },
    });
    return { success: true, data: beneficios };
  }

  async toggleAtivo(id: string) {
    const beneficio = await this.prisma.beneficio.findUnique({ where: { id } });
    if (!beneficio) throw new NotFoundException('Benefício não encontrado');

    const updated = await this.prisma.beneficio.update({
      where: { id },
      data: { ativo: !beneficio.ativo },
    });
    return { success: true, data: updated };
  }
}
