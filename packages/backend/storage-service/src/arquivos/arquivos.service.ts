import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FiltrarArquivosDto, AtualizarArquivoDto, MoverArquivoDto } from './dto/arquivos.dto';

@Injectable()
export class ArquivosService {
  private readonly logger = new Logger(ArquivosService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: FiltrarArquivosDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.pasta) where.pasta = query.pasta;
    if (query.extensao) where.extensao = query.extensao;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { nomeOriginal: { contains: query.search, mode: 'insensitive' } },
        { nome: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [arquivos, total] = await Promise.all([
      this.prisma.arquivo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.arquivo.count({ where }),
    ]);

    return {
      success: true,
      data: arquivos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id } });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');
    return { success: true, data: arquivo };
  }

  async update(id: string, dto: AtualizarArquivoDto) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id } });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');

    const data: any = {};
    if (dto.nome !== undefined) data.nome = dto.nome;
    if (dto.tags !== undefined) data.tags = dto.tags;

    const updated = await this.prisma.arquivo.update({ where: { id }, data });
    return { success: true, data: updated };
  }

  async move(id: string, dto: MoverArquivoDto) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id } });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');

    const updated = await this.prisma.arquivo.update({
      where: { id },
      data: { pasta: dto.pastaDestino },
    });

    this.logger.log(`File ${id} moved to ${dto.pastaDestino}`);
    return { success: true, data: updated };
  }

  async softDelete(id: string) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id } });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');

    const updated = await this.prisma.arquivo.update({
      where: { id },
      data: { status: 'DELETADO' },
    });

    this.logger.log(`File ${id} soft deleted`);
    return { success: true, data: updated };
  }

  async restore(id: string) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id } });
    if (!arquivo) throw new BadRequestException('Arquivo não encontrado');
    if (arquivo.status !== 'DELETADO') {
      throw new BadRequestException('Arquivo não está deletado');
    }

    const updated = await this.prisma.arquivo.update({
      where: { id },
      data: { status: 'ARMAZENADO' },
    });

    this.logger.log(`File ${id} restored`);
    return { success: true, data: updated };
  }
}
