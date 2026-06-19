import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { CreateUserDto } from '../auth/dto/login.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Email já cadastrado');

    const existingCpf = await this.prisma.user.findUnique({ where: { cpf: dto.cpf } });
    if (existingCpf) throw new ConflictException('CPF já cadastrado');

    const salt = await bcrypt.genSalt(12);
    const senha = await bcrypt.hash(dto.senha, salt);

    const user = await this.prisma.user.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        nome: dto.nome,
        cpf: dto.cpf,
        email: dto.email,
        celular: dto.celular,
        perfil: dto.perfil,
        departamento: dto.departamento,
        cargo: dto.cargo,
        senha,
        salt,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        perfil: true,
        departamento: true,
        cargo: true,
        ativo: true,
        createdAt: true,
      },
    });

    return { success: true, user };
  }

  async findAll(companyId: string, query: { page?: number; limit?: number; perfil?: string; departamento?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.perfil) where.perfil = query.perfil;
    if (query.departamento) where.departamento = query.departamento;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          perfil: true,
          departamento: true,
          cargo: true,
          setor: true,
          ativo: true,
          ultimoAcesso: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { company: { select: { id: true, nomeFantasia: true } } },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const { senha, salt, mfaSecret, ...sanitized } = user;
    return { success: true, user: sanitized };
  }

  async update(id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (data.senha) {
      const salt = await bcrypt.genSalt(12);
      data.senha = await bcrypt.hash(data.senha, salt);
      data.salt = salt;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        departamento: true,
        cargo: true,
        ativo: true,
        updatedAt: true,
      },
    });

    return { success: true, user: updated };
  }

  async toggleStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { ativo: !user.ativo },
    });

    return { success: true, ativo: updated.ativo };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    await this.prisma.user.update({
      where: { id },
      data: { ativo: false },
    });

    return { success: true, message: 'Usuário desativado com sucesso' };
  }
}
