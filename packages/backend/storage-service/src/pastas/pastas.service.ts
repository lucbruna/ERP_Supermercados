import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CriarPastaDto, AtualizarPastaDto } from './dto/pastas.dto';

@Injectable()
export class PastasService {
  private readonly logger = new Logger(PastasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CriarPastaDto) {
    const caminho = dto.caminho || `/${dto.nome}`;

    const existing = await this.prisma.pasta.findFirst({
      where: { caminho, paiId: dto.paiId || null },
    });
    if (existing) {
      throw new ConflictException('Já existe uma pasta com este nome neste local');
    }

    const pasta = await this.prisma.pasta.create({
      data: {
        nome: dto.nome,
        caminho,
        paiId: dto.paiId || null,
        criadoPor: dto.criadoPor || 'system',
      },
    });

    this.logger.log(`Folder created: ${pasta.id} - ${caminho}`);
    return { success: true, data: pasta };
  }

  async findAll() {
    const pastas = await this.prisma.pasta.findMany({
      orderBy: { criadoEm: 'desc' },
    });
    return { success: true, data: pastas };
  }

  async findOne(id: string) {
    const pasta = await this.prisma.pasta.findUnique({ where: { id } });
    if (!pasta) throw new NotFoundException('Pasta não encontrada');
    return { success: true, data: pasta };
  }

  async update(id: string, dto: AtualizarPastaDto) {
    const pasta = await this.prisma.pasta.findUnique({ where: { id } });
    if (!pasta) throw new NotFoundException('Pasta não encontrada');

    const updated = await this.prisma.pasta.update({
      where: { id },
      data: { nome: dto.nome },
    });

    return { success: true, data: updated };
  }

  async remove(id: string) {
    const pasta = await this.prisma.pasta.findUnique({ where: { id } });
    if (!pasta) throw new NotFoundException('Pasta não encontrada');

    await this.prisma.pasta.delete({ where: { id } });
    this.logger.log(`Folder deleted: ${id}`);

    return { success: true, data: { id } };
  }

  async getConteudo(id: string) {
    const pasta = await this.prisma.pasta.findUnique({ where: { id } });
    if (!pasta) throw new NotFoundException('Pasta não encontrada');

    const [subpastas, arquivos] = await Promise.all([
      this.prisma.pasta.findMany({
        where: { paiId: id },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.arquivo.findMany({
        where: { pasta: pasta.caminho, status: 'ARMAZENADO' },
        orderBy: { criadoEm: 'desc' },
      }),
    ]);

    return {
      success: true,
      data: {
        pasta,
        subpastas,
        arquivos,
      },
    };
  }
}
