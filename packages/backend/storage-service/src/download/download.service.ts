import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
  StreamableFile,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../common/prisma.service';
import { STORAGE_PROVIDER_TOKEN } from '../providers/storage-provider.interface';
import { StorageProvider } from '../providers/storage-provider.interface';
import archiver from 'archiver';
import { Readable, PassThrough } from 'stream';

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN) private storageProvider: StorageProvider,
  ) {}

  async getFileMetadata(id: string) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id } });
    if (!arquivo || arquivo.status === 'DELETADO') {
      throw new NotFoundException('Arquivo não encontrado');
    }
    return { success: true, data: arquivo };
  }

  async downloadFile(id: string, res: Response, range?: string) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id } });
    if (!arquivo || arquivo.status === 'DELETADO') {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const stream = await this.storageProvider.download(arquivo.key);
    const mimeType = arquivo.mimeType || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${arquivo.nomeOriginal}"`);
    res.setHeader('Accept-Ranges', 'bytes');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : arquivo.tamanhoBytes - 1;

      if (start >= arquivo.tamanhoBytes) {
        throw new HttpException('Range Not Satisfiable', 416);
      }

      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${arquivo.tamanhoBytes}`);
      res.setHeader('Content-Length', end - start + 1);
    } else {
      res.setHeader('Content-Length', arquivo.tamanhoBytes);
    }

    (stream as Readable).pipe(res);
  }

  async downloadVersion(id: string, versao: number, res: Response) {
    const version = await this.prisma.versaoArquivo.findFirst({
      where: { arquivoId: id, versao },
    });
    if (!version) {
      throw new NotFoundException('Versão não encontrada');
    }

    const stream = await this.storageProvider.download(version.key);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${version.nomeOriginal}"`);
    res.setHeader('Content-Length', version.tamanhoBytes);

    (stream as Readable).pipe(res);
  }

  async downloadZip(pastaId: string, res: Response) {
    const pasta = await this.prisma.pasta.findUnique({ where: { id: pastaId } });
    if (!pasta) {
      throw new NotFoundException('Pasta não encontrada');
    }

    const arquivos = await this.prisma.arquivo.findMany({
      where: { pasta: pasta.caminho, status: 'ARMAZENADO' },
    });

    if (arquivos.length === 0) {
      throw new NotFoundException('Nenhum arquivo encontrado nesta pasta');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${pasta.nome}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => { throw err; });
    archive.pipe(res);

    for (const arquivo of arquivos) {
      const stream = await this.storageProvider.download(arquivo.key);
      archive.append(stream as Readable, { name: arquivo.nomeOriginal });
    }

    archive.finalize();
  }

  async headFile(id: string, res: Response) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id } });
    if (!arquivo || arquivo.status === 'DELETADO') {
      throw new NotFoundException('Arquivo não encontrado');
    }

    res.setHeader('Content-Type', arquivo.mimeType);
    res.setHeader('Content-Length', arquivo.tamanhoBytes);
    res.setHeader('Content-Disposition', `inline; filename="${arquivo.nomeOriginal}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('ETag', `"${arquivo.hash}"`);
    res.status(200).end();
  }
}
