import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SearchCfopDto } from './dto/search-cfop.dto';

@Injectable()
export class CfopService {
  private readonly logger = new Logger(CfopService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listar(query: SearchCfopDto) {
    const where = query.tipo ? { tipo: query.tipo } : {};
    const data = await this.prisma.cfop.findMany({
      where,
      orderBy: { codigo: 'asc' },
    });
    return { success: true, data };
  }

  async findByCodigo(codigo: string) {
    const data = await this.prisma.cfop.findUnique({ where: { codigo } });
    if (!data) throw new NotFoundException('CFOP não encontrado');
    return { success: true, data };
  }

  async findByNatureza(natureza: string) {
    const data = await this.prisma.cfop.findMany({
      where: {
        OR: [
          { descricao: { contains: natureza, mode: 'insensitive' } },
          { aplicacao: { contains: natureza, mode: 'insensitive' } },
        ],
      },
      orderBy: { codigo: 'asc' },
    });
    return { success: true, data };
  }
}
