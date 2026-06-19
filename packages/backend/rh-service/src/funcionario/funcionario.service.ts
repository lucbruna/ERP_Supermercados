import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFuncionarioDto, UpdateFuncionarioDto, FuncionarioQueryDto } from './dto/create-funcionario.dto';

@Injectable()
export class FuncionarioService {
  private readonly logger = new Logger(FuncionarioService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFuncionarioDto) {
    const [matriculaExist, cpfExist, emailExist] = await Promise.all([
      this.prisma.funcionario.findUnique({ where: { matricula: dto.matricula } }),
      this.prisma.funcionario.findUnique({ where: { cpf: dto.cpf } }),
      this.prisma.funcionario.findUnique({ where: { email: dto.email } }),
    ]);

    if (matriculaExist) throw new ConflictException('Matrícula já cadastrada');
    if (cpfExist) throw new ConflictException('CPF já cadastrado');
    if (emailExist) throw new ConflictException('Email já cadastrado');

    const funcionario = await this.prisma.funcionario.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        matricula: dto.matricula,
        nome: dto.nome,
        cpf: dto.cpf,
        rg: dto.rg,
        email: dto.email,
        celular: dto.celular,
        foto: dto.foto,
        dataAdmissao: new Date(dto.dataAdmissao),
        dataDemissao: dto.dataDemissao ? new Date(dto.dataDemissao) : null,
        salario: dto.salario,
        cargo: dto.cargo,
        departamento: dto.departamento,
        setor: dto.setor,
        jornadaTrabalho: dto.jornadaTrabalho || {},
        dadosBancarios: dto.dadosBancarios || {},
        documentos: dto.documentos || [],
        status: dto.status || 'ATIVO',
      },
    });

    this.logger.log(`Funcionário criado: ${funcionario.nome} (${funcionario.matricula})`);
    return { success: true, data: funcionario };
  }

  async findAll(companyId: string, query: FuncionarioQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.search) {
      where.OR = [
        { nome: { contains: query.search, mode: 'insensitive' } },
        { matricula: { contains: query.search, mode: 'insensitive' } },
        { cpf: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.departamento) where.departamento = query.departamento;
    if (query.cargo) where.cargo = query.cargo;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.funcionario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.funcionario.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
      include: {
        ponto: { orderBy: { dataHora: 'desc' }, take: 10 },
        ferias: { orderBy: { dataInicio: 'desc' } },
        beneficios: { include: { beneficio: true } },
        treinamentos: { include: { treinamento: true } },
      },
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');
    return { success: true, data: funcionario };
  }

  async findByMatricula(matricula: string) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { matricula },
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');
    return { success: true, data: funcionario };
  }

  async update(id: string, dto: UpdateFuncionarioDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.dataDemissao) data.dataDemissao = new Date(dto.dataDemissao);

    const updated = await this.prisma.funcionario.update({
      where: { id },
      data,
    });

    return { success: true, data: updated };
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    const updated = await this.prisma.funcionario.update({
      where: { id },
      data: { status: status as any },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.funcionario.update({
      where: { id },
      data: { ativo: false, status: 'DEMITIDO' },
    });
    return { success: true, message: 'Funcionário desativado com sucesso' };
  }
}
