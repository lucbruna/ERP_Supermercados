import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCupomDto } from './dto/create-cupom.dto';
import { UpdateCupomDto } from './dto/update-cupom.dto';
import { UsarCupomDto } from './dto/usar-cupom.dto';
import { ValidarCupomDto } from './dto/validar-cupom.dto';

@Injectable()
export class CuponsService {
  private readonly logger = new Logger(CuponsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCupomDto) {
    return this.prisma.cupom.create({
      data: {
        ...dto,
        dataInicio: new Date(dto.dataInicio),
        dataFim: new Date(dto.dataFim),
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.cupom.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const cupom = await this.prisma.cupom.findUnique({
      where: { id },
      include: { usos: true },
    });
    if (!cupom) throw new NotFoundException('Cupom não encontrado');
    return cupom;
  }

  async update(id: string, dto: UpdateCupomDto) {
    await this.findById(id);
    return this.prisma.cupom.update({
      where: { id },
      data: {
        ...dto,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.cupom.update({ where: { id }, data: { ativo: false } });
  }

  async validar(dto: ValidarCupomDto) {
    const cupom = await this.prisma.cupom.findUnique({
      where: { companyId_codigo: { companyId: dto.companyId, codigo: dto.codigo } },
    });

    if (!cupom) throw new NotFoundException('Cupom não encontrado');
    if (!cupom.ativo) throw new BadRequestException('Cupom inativo');
    if (cupom.usoLimite > 0 && cupom.usoAtual >= cupom.usoLimite) {
      throw new BadRequestException('Cupom atingiu limite de usos');
    }

    const now = new Date();
    if (now < cupom.dataInicio) throw new BadRequestException('Cupom ainda não está válido');
    if (now > cupom.dataFim) throw new BadRequestException('Cupom expirado');

    if (cupom.clienteId && dto.clienteId && cupom.clienteId !== dto.clienteId) {
      throw new BadRequestException('Cupom não disponível para este cliente');
    }

    if (dto.valorCompra && cupom.valorMinimo && dto.valorCompra < Number(cupom.valorMinimo)) {
      throw new BadRequestException('Valor mínimo da compra não atingido');
    }

    return { valido: true, cupom };
  }

  async usar(dto: UsarCupomDto) {
    const cupom = await this.prisma.cupom.findUnique({ where: { id: dto.cupomId } });
    if (!cupom) throw new NotFoundException('Cupom não encontrado');

    const validation = await this.validar({
      codigo: cupom.codigo,
      companyId: cupom.companyId,
      clienteId: dto.clienteId,
    });

    const usoExistente = await this.prisma.cupomUso.findUnique({
      where: { cupomId_clienteId_vendaId: { cupomId: dto.cupomId, clienteId: dto.clienteId, vendaId: dto.vendaId } },
    });
    if (usoExistente) throw new BadRequestException('Cupom já utilizado nesta venda');

    const [uso] = await this.prisma.$transaction([
      this.prisma.cupomUso.create({ data: dto }),
      this.prisma.cupom.update({
        where: { id: dto.cupomId },
        data: { usoAtual: { increment: 1 } },
      }),
    ]);

    return uso;
  }

  async getUsos(cupomId: string) {
    return this.prisma.cupomUso.findMany({
      where: { cupomId },
      include: { cliente: true },
      orderBy: { data: 'desc' },
    });
  }
}
