import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFidelidadeDto } from './dto/create-fidelidade.dto';
import { UpdateFidelidadeDto } from './dto/update-fidelidade.dto';

@Injectable()
export class FidelidadeService {
  private readonly logger = new Logger(FidelidadeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFidelidadeDto) {
    return this.prisma.fidelidadePrograma.create({ data: dto });
  }

  async findAll(companyId: string) {
    return this.prisma.fidelidadePrograma.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const programa = await this.prisma.fidelidadePrograma.findUnique({ where: { id } });
    if (!programa) throw new NotFoundException('Programa de fidelidade não encontrado');
    return programa;
  }

  async update(id: string, dto: UpdateFidelidadeDto) {
    await this.findById(id);
    return this.prisma.fidelidadePrograma.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.fidelidadePrograma.update({ where: { id }, data: { ativo: false } });
  }

  async getRegras(id: string) {
    const programa = await this.findById(id);
    return programa.regras;
  }

  async updateRegras(id: string, regras: any[]) {
    await this.findById(id);
    return this.prisma.fidelidadePrograma.update({ where: { id }, data: { regras } });
  }
}
