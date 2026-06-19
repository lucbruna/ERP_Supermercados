import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMotoristaDto, UpdateMotoristaDto, MotoristaQueryDto } from './dto/motoristas.dto';

@Injectable()
export class MotoristasService {
  private readonly logger = new Logger(MotoristasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMotoristaDto) {
    const existing = await this.prisma.motorista.findUnique({ where: { cpf: dto.cpf } });
    if (existing) throw new ConflictException('CPF já cadastrado');

    const motorista = await this.prisma.motorista.create({ data: dto });
    this.logger.log(`Motorista criado: ${motorista.nome}`);
    return { success: true, data: motorista };
  }

  async findAll(query: MotoristaQueryDto) {
    const where: any = {};
    if (query.situacao) where.situacao = query.situacao;
    if (query.search) {
      where.OR = [
        { nome: { contains: query.search, mode: 'insensitive' } },
        { cpf: { contains: query.search } },
        { cnh: { contains: query.search } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.motorista.findMany({ where, skip, take: limit, orderBy: { nome: 'asc' } }),
      this.prisma.motorista.count({ where }),
    ]);

    return { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const motorista = await this.prisma.motorista.findUnique({
      where: { id },
      include: { _count: { select: { rotas: true, abastecimentos: true } } },
    });
    if (!motorista) throw new NotFoundException('Motorista não encontrado');
    return { success: true, data: motorista };
  }

  async update(id: string, dto: UpdateMotoristaDto) {
    await this.findOne(id);
    const updated = await this.prisma.motorista.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.motorista.update({ where: { id }, data: { situacao: 'INATIVO' } });
    return { success: true, message: 'Motorista desativado' };
  }

  async findHistorico(id: string) {
    await this.findOne(id);

    const [rotas, abastecimentos] = await Promise.all([
      this.prisma.rota.findMany({
        where: { motoristaId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { veiculo: { select: { placa: true, marca: true, modelo: true } } },
      }),
      this.prisma.abastecimento.findMany({
        where: { motoristaId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { veiculo: { select: { placa: true } } },
      }),
    ]);

    return { success: true, data: { rotas, abastecimentos } };
  }
}
