import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { RenovarContratoDto } from './dto/renovar-contrato.dto';
import { QueryContratoDto } from './dto/query-contrato.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContratoDto) {
    return this.prisma.contratoFornecedor.create({
      data: {
        ...dto,
        dataInicio: new Date(dto.dataInicio),
        dataFim: new Date(dto.dataFim),
      } as any,
    });
  }

  async findAll(query: QueryContratoDto) {
    const { companyId, fornecedorId, status, numero, pagina = 1, limite = 10 } = query;
    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (fornecedorId) where.fornecedorId = fornecedorId;
    if (status) where.status = status;
    if (numero) where.numero = { contains: numero };

    const total = await this.prisma.contratoFornecedor.count({ where });
    const data = await this.prisma.contratoFornecedor.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { createdAt: 'desc' },
      include: { Fornecedor: true },
    });

    return paginate(data, total, pagina, limite);
  }

  async findOne(id: string) {
    const record = await this.prisma.contratoFornecedor.findUnique({
      where: { id },
      include: { Fornecedor: true },
    });
    if (!record) throw new NotFoundException('Contrato não encontrado');
    return record;
  }

  async update(id: string, dto: UpdateContratoDto) {
    await this.findOne(id);
    return this.prisma.contratoFornecedor.update({
      where: { id },
      data: dto as any,
    });
  }

  async renovar(id: string, dto: RenovarContratoDto) {
    const contrato = await this.findOne(id);
    if (contrato.status === 'ENCERRADO') {
      throw new BadRequestException('Contrato encerrado não pode ser renovado');
    }

    await this.prisma.contratoFornecedor.update({
      where: { id },
      data: { status: 'ENCERRADO' },
    });

    return this.prisma.contratoFornecedor.create({
      data: {
        companyId: contrato.companyId,
        fornecedorId: contrato.fornecedorId,
        numero: `${contrato.numero}-R${new Date().getFullYear()}`,
        dataInicio: new Date(dto.novaDataInicio),
        dataFim: new Date(dto.novaDataFim),
        condicoes: contrato.condicoes,
        valorEstimado: contrato.valorEstimado,
        status: 'ATIVO',
      } as any,
    });
  }

  async suspender(id: string) {
    const contrato = await this.findOne(id);
    if (contrato.status !== 'ATIVO') {
      throw new BadRequestException('Apenas contratos ativos podem ser suspensos');
    }
    return this.prisma.contratoFornecedor.update({
      where: { id },
      data: { status: 'SUSPENSO' },
    });
  }

  async reativar(id: string) {
    const contrato = await this.findOne(id);
    if (contrato.status !== 'SUSPENSO') {
      throw new BadRequestException('Apenas contratos suspensos podem ser reativados');
    }
    return this.prisma.contratoFornecedor.update({
      where: { id },
      data: { status: 'ATIVO' },
    });
  }

  async encerrar(id: string) {
    const contrato = await this.findOne(id);
    if (contrato.status === 'ENCERRADO') {
      throw new BadRequestException('Contrato já está encerrado');
    }
    return this.prisma.contratoFornecedor.update({
      where: { id },
      data: { status: 'ENCERRADO' },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contratoFornecedor.delete({ where: { id } });
  }
}
