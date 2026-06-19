import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateModeloDto, UpdateModeloDto, ModeloQueryDto } from './dto/create-modelo.dto';

@Injectable()
export class ModelosService {
  private readonly logger = new Logger(ModelosService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateModeloDto) {
    const modelo = await this.prisma.modeloMensagem.create({
      data: {
        companyId: dto.companyId,
        nome: dto.nome,
        tipo: dto.tipo,
        assunto: dto.assunto,
        conteudo: dto.conteudo,
        variaveis: dto.variaveis || [],
      },
    });

    this.logger.log(`Modelo criado: ${modelo.nome}`);
    return { success: true, data: modelo };
  }

  async findAll(companyId: string, query: ModeloQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.search) {
      where.OR = [
        { nome: { contains: query.search, mode: 'insensitive' } },
        { conteudo: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.tipo) where.tipo = query.tipo;

    const [data, total] = await Promise.all([
      this.prisma.modeloMensagem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.modeloMensagem.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const modelo = await this.prisma.modeloMensagem.findUnique({ where: { id } });
    if (!modelo) throw new NotFoundException('Modelo não encontrado');
    return { success: true, data: modelo };
  }

  async update(id: string, dto: UpdateModeloDto) {
    await this.findOne(id);
    const updated = await this.prisma.modeloMensagem.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.modeloMensagem.delete({ where: { id } });
    return { success: true, message: 'Modelo removido com sucesso' };
  }
}
