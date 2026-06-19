import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SearchNcmDto } from './dto/search-ncm.dto';

@Injectable()
export class NcmService {
  private readonly logger = new Logger(NcmService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchNcmDto) {
    const { search } = query;
    if (!search) {
      const data = await this.prisma.ncm.findMany({ orderBy: { codigo: 'asc' }, take: 100 });
      return { success: true, data };
    }

    const data = await this.prisma.ncm.findMany({
      where: {
        OR: [
          { codigo: { contains: search } },
          { descricao: { contains: search, mode: 'insensitive' } },
        ],
      },
      orderBy: { codigo: 'asc' },
      take: 50,
    });

    return { success: true, data };
  }

  async findByCodigo(codigo: string) {
    const data = await this.prisma.ncm.findUnique({ where: { codigo } });
    if (!data) throw new NotFoundException('NCM não encontrado');
    return { success: true, data };
  }
}
