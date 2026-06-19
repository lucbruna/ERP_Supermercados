import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { STORAGE_PROVIDER_TOKEN } from '../providers/storage-provider.interface';
import { StorageProvider } from '../providers/storage-provider.interface';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import {
  ProcessarImagemDto,
  ComprimirImagemDto,
} from './dto/processamento.dto';
import { Readable } from 'stream';

@Injectable()
export class ProcessamentoService {
  private readonly logger = new Logger(ProcessamentoService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN) private storageProvider: StorageProvider,
  ) {}

  private async getImageBuffer(arquivoId: string): Promise<Buffer> {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id: arquivoId } });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');
    if (!arquivo.mimeType.startsWith('image/')) {
      throw new BadRequestException('Arquivo não é uma imagem');
    }

    const stream = await this.storageProvider.download(arquivo.key);
    const chunks: Buffer[] = [];
    for await (const chunk of stream as Readable) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async processarImagem(dto: ProcessarImagemDto) {
    let buffer = await this.getImageBuffer(dto.arquivoId);
    const pipeline = sharp(buffer);

    if (dto.cropLeft !== undefined && dto.cropTop !== undefined &&
        dto.cropWidth !== undefined && dto.cropHeight !== undefined) {
      pipeline.extract({
        left: dto.cropLeft,
        top: dto.cropTop,
        width: dto.cropWidth,
        height: dto.cropHeight,
      });
    }

    if (dto.width || dto.height) {
      pipeline.resize(dto.width, dto.height, { fit: 'inside', withoutEnlargement: true });
    }

    if (dto.rotate) {
      pipeline.rotate(dto.rotate);
    }

    const processedBuffer = await pipeline.toBuffer();
    const metadata = await sharp(processedBuffer).metadata();

    const key = `processed/${uuid()}.${metadata.format}`;

    const uploadResult = await this.storageProvider.upload(
      processedBuffer,
      key,
      `image/${metadata.format}`,
    );

    const arquivo = await this.prisma.arquivo.create({
      data: {
        nome: `processed_${uuid()}.${metadata.format}`,
        nomeOriginal: `processed_${uuid()}.${metadata.format}`,
        extensao: `.${metadata.format}`,
        mimeType: `image/${metadata.format}`,
        tamanhoBytes: processedBuffer.length,
        hash: '',
        key: uploadResult.key,
        url: uploadResult.url,
        provedor: uploadResult.provedor,
        pasta: '/processed',
        tags: ['processed'],
        dimensoes: { width: metadata.width, height: metadata.height },
        status: 'ARMAZENADO',
        criadoPor: 'system',
      },
    });

    return { success: true, data: arquivo };
  }

  async comprimirImagem(dto: ComprimirImagemDto) {
    const buffer = await this.getImageBuffer(dto.arquivoId);
    const formato = dto.formato || 'jpeg';
    const qualidade = dto.qualidade ?? 80;

    let processedBuffer: Buffer;
    let mimeType: string;

    switch (formato) {
      case 'jpeg':
        processedBuffer = await sharp(buffer).jpeg({ quality: qualidade }).toBuffer();
        mimeType = 'image/jpeg';
        break;
      case 'png':
        processedBuffer = await sharp(buffer).png({ quality: qualidade }).toBuffer();
        mimeType = 'image/png';
        break;
      case 'webp':
        processedBuffer = await sharp(buffer).webp({ quality: qualidade }).toBuffer();
        mimeType = 'image/webp';
        break;
      default:
        throw new BadRequestException(`Formato não suportado: ${formato}`);
    }

    const metadata = await sharp(processedBuffer).metadata();
    const key = `compressed/${uuid()}.${formato}`;

    const uploadResult = await this.storageProvider.upload(processedBuffer, key, mimeType);

    const arquivo = await this.prisma.arquivo.create({
      data: {
        nome: `compressed_${uuid()}.${formato}`,
        nomeOriginal: `compressed_${uuid()}.${formato}`,
        extensao: `.${formato}`,
        mimeType,
        tamanhoBytes: processedBuffer.length,
        hash: '',
        key: uploadResult.key,
        url: uploadResult.url,
        provedor: uploadResult.provedor,
        pasta: '/compressed',
        tags: ['compressed'],
        dimensoes: { width: metadata.width, height: metadata.height },
        status: 'ARMAZENADO',
        criadoPor: 'system',
      },
    });

    return { success: true, data: arquivo };
  }

  async ocr(arquivoId: string) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id: arquivoId } });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');

    const nomeBase = arquivo.nomeOriginal.replace(/\.[^/.]+$/, '');
    const palavras = nomeBase.replace(/[_-]/g, ' ').split(/\s+/);

    const textoSimulado = palavras
      .map((p) => `[OCR SIMULADO] Conteúdo extraído de: ${p}`)
      .join('\n');

    return {
      success: true,
      data: {
        arquivoId,
        texto: textoSimulado,
        confianca: 0.85,
        observacao: 'OCR simulado - integrar serviço real (Tesseract/Google Vision)',
      },
    };
  }

  async pdfPreview(arquivoId: string) {
    const arquivo = await this.prisma.arquivo.findUnique({ where: { id: arquivoId } });
    if (!arquivo) throw new NotFoundException('Arquivo não encontrado');
    if (arquivo.mimeType !== 'application/pdf') {
      throw new BadRequestException('Arquivo não é um PDF');
    }

    const stream = await this.storageProvider.download(arquivo.key);
    const chunks: Buffer[] = [];
    for await (const chunk of stream as Readable) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    const previewBuffer = await sharp(pdfBuffer, { page: 0 })
      .resize(300, 400, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toBuffer();

    const key = `pdf-preview/${uuid()}.jpg`;
    const uploadResult = await this.storageProvider.upload(previewBuffer, key, 'image/jpeg');

    return {
      success: true,
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        provedor: uploadResult.provedor,
      },
    };
  }
}
