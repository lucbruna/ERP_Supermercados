import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CriarVersaoDto } from './dto/versoes.dto';

@Injectable()
export class VersoesService {
  private readonly logger = new Logger(VersoesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CriarVersaoDto) {
    const arquivo = await this.prisma.arquivo.findUnique({
      where: { id: dto.arquivoId },
    });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');

    const ultimaVersao = await this.prisma.versaoArquivo.findFirst({
      where: { arquivoId: dto.arquivoId },
      orderBy: { versao: 'desc' },
    });

    const novaVersao = ultimaVersao ? ultimaVersao.versao + 1 : 1;

    const versao = await this.prisma.versaoArquivo.create({
      data: {
        arquivoId: dto.arquivoId,
        versao: novaVersao,
        nomeOriginal: dto.nomeOriginal,
        tamanhoBytes: dto.tamanhoBytes,
        hash: dto.hash,
        key: dto.key,
        url: dto.url,
        criadoPor: dto.criadoPor || 'system',
      },
    });

    this.logger.log(`Version ${novaVersao} created for file ${dto.arquivoId}`);
    return { success: true, data: versao };
  }

  async list(arquivoId: string) {
    const arquivo = await this.prisma.arquivo.findUnique({
      where: { id: arquivoId },
    });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');

    const versoes = await this.prisma.versaoArquivo.findMany({
      where: { arquivoId },
      orderBy: { versao: 'desc' },
    });

    return { success: true, data: versoes };
  }

  async restore(versaoId: string) {
    const versao = await this.prisma.versaoArquivo.findUnique({
      where: { id: versaoId },
    });
    if (!versao) throw new NotFoundException('Versão não encontrada');

    const updated = await this.prisma.arquivo.update({
      where: { id: versao.arquivoId },
      data: {
        key: versao.key,
        url: versao.url,
        hash: versao.hash,
        tamanhoBytes: versao.tamanhoBytes,
        nomeOriginal: versao.nomeOriginal,
      },
    });

    this.logger.log(`File ${versao.arquivoId} restored to version ${versao.versao}`);
    return { success: true, data: updated };
  }
}
