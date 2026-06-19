import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { SearchClienteDto } from './dto/search-cliente.dto';
import { CreateEnderecoDto, UpdateEnderecoDto } from './dto/endereco.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientesService {
  private readonly logger = new Logger(ClientesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClienteDto) {
    const existingCpf = await this.prisma.cliente.findUnique({
      where: { companyId_cpfCnpj: { companyId: dto.companyId, cpfCnpj: dto.cpfCnpj } },
    });
    if (existingCpf) {
      throw new ConflictException('CPF/CNPJ já cadastrado para esta empresa');
    }

    const existingEmail = await this.prisma.cliente.findUnique({
      where: { companyId_email: { companyId: dto.companyId, email: dto.email } },
    });
    if (existingEmail) {
      throw new ConflictException('Email já cadastrado para esta empresa');
    }

    return this.prisma.cliente.create({
      data: {
        companyId: dto.companyId,
        nome: dto.nome,
        cpfCnpj: dto.cpfCnpj,
        rg: dto.rg,
        email: dto.email,
        celular: dto.celular,
        telefone: dto.telefone,
        dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : undefined,
        genero: dto.genero,
        endereco: dto.endereco ?? undefined,
        segmento: dto.segmento,
        preferencias: dto.preferencias ?? [],
        ativo: dto.ativo ?? true,
      },
    });
  }

  async findAll(query: SearchClienteDto) {
    const { pagina = 1, limite = 10, nome, cpfCnpj, email, celular, companyId, segmento, ativo, orderBy, orderDirection } = query;
    const skip = (pagina - 1) * limite;

    const where: Prisma.ClienteWhereInput = {};
    if (nome) where.nome = { contains: nome, mode: 'insensitive' };
    if (cpfCnpj) where.cpfCnpj = { contains: cpfCnpj };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (celular) where.celular = { contains: celular };
    if (companyId) where.companyId = companyId;
    if (segmento) where.segmento = segmento;
    if (ativo !== undefined) where.ativo = ativo;

    const orderByClause: Prisma.ClienteOrderByWithRelationInput = {};
    if (orderBy) {
      orderByClause[orderBy as keyof Prisma.ClienteOrderByWithRelationInput] = orderDirection || 'asc';
    } else {
      orderByClause.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({ where, skip, take: limite, orderBy: orderByClause }),
      this.prisma.cliente.count({ where }),
    ]);

    return { data, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async findById(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        enderecos: true,
        grupos: { include: { grupo: true } },
      },
    });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findById(id);

    if (dto.email) {
      const existing = await this.prisma.cliente.findFirst({
        where: { email: dto.email, id: { not: id } },
      });
      if (existing) throw new ConflictException('Email já cadastrado para outro cliente');
    }

    return this.prisma.cliente.update({
      where: { id },
      data: {
        ...dto,
        dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.cliente.update({ where: { id }, data: { ativo: false } });
  }

  async getHistorico(id: string) {
    await this.findById(id);
    const [cashback, pontos, cupons] = await Promise.all([
      this.prisma.cashbackTransacao.findMany({ where: { clienteId: id }, orderBy: { data: 'desc' }, take: 50 }),
      this.prisma.pontuacaoTransacao.findMany({ where: { clienteId: id }, orderBy: { data: 'desc' }, take: 50 }),
      this.prisma.cupomUso.findMany({ where: { clienteId: id }, include: { cupom: true }, orderBy: { data: 'desc' }, take: 50 }),
    ]);
    return { cashback, pontos, cupons };
  }

  async createEndereco(dto: CreateEnderecoDto) {
    await this.findById(dto.clienteId);
    if (dto.principal) {
      await this.prisma.enderecoCliente.updateMany({
        where: { clienteId: dto.clienteId },
        data: { principal: false },
      });
    }
    return this.prisma.enderecoCliente.create({ data: dto });
  }

  async updateEndereco(id: string, dto: UpdateEnderecoDto) {
    const endereco = await this.prisma.enderecoCliente.findUnique({ where: { id } });
    if (!endereco) throw new NotFoundException('Endereço não encontrado');
    if (dto.principal) {
      await this.prisma.enderecoCliente.updateMany({
        where: { clienteId: endereco.clienteId },
        data: { principal: false },
      });
    }
    return this.prisma.enderecoCliente.update({ where: { id }, data: dto });
  }

  async removeEndereco(id: string) {
    const endereco = await this.prisma.enderecoCliente.findUnique({ where: { id } });
    if (!endereco) throw new NotFoundException('Endereço não encontrado');
    return this.prisma.enderecoCliente.delete({ where: { id } });
  }
}
