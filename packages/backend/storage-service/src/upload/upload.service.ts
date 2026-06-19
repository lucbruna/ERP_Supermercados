import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { STORAGE_PROVIDER_TOKEN } from '../providers/storage-provider.interface';
import { StorageProvider } from '../providers/storage-provider.interface';
import * as crypto from 'crypto';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly allowedMimeTypes: string[];
  private readonly maxFileSize: number;

  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN) private storageProvider: StorageProvider,
    private configService: ConfigService,
  ) {
    const types = this.configService.get('ALLOWED_MIME_TYPES', '');
    this.allowedMimeTypes = types ? types.split(',') : [];
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 50 * 1024 * 1024);
  }

  private computeHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private generateKey(
    nome: string,
    pasta: string,
    extensao: string,
  ): string {
    const id = uuid();
    const folder = pasta.replace(/^\/+|\/+$/g, '') || 'geral';
    return `${folder}/${id}${extensao}`;
  }

  private validateMimeType(mimeType: string) {
    if (this.allowedMimeTypes.length === 0) return;
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `MIME type ${mimeType} não permitido. Permitidos: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  async uploadSingle(
    file: Express.Multer.File,
    pasta: string = '/',
    tags: string[] = [],
    criadoPor: string = 'system',
  ) {
    this.validateMimeType(file.mimetype);

    const hash = this.computeHash(file.buffer);
    const extensao = path.extname(file.originalname).toLowerCase();
    const nome = `${crypto.createHash('md5').update(file.originalname + Date.now()).digest('hex')}${extensao}`;
    const key = this.generateKey(nome, pasta, extensao);
    const mimeType = file.mimetype;

    const uploadResult = await this.storageProvider.upload(file.buffer, key, mimeType);

    let dimensoes: Record<string, number | undefined> | null = null;
    if (mimeType.startsWith('image/')) {
      try {
        const metadata = await sharp(file.buffer).metadata();
        dimensoes = { width: metadata.width, height: metadata.height };
      } catch {}
    }

    const arquivo = await this.prisma.arquivo.create({
      data: {
        nome,
        nomeOriginal: file.originalname,
        extensao,
        mimeType,
        tamanhoBytes: file.buffer.length,
        hash,
        key: uploadResult.key,
        url: uploadResult.url,
        provedor: uploadResult.provedor,
        pasta,
        tags,
        dimensoes: dimensoes || undefined,
        status: 'ARMAZENADO',
        criadoPor,
      },
    });

    this.logger.log(`File uploaded: ${arquivo.id} - ${file.originalname}`);

    return { success: true, data: arquivo };
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    pasta: string = '/',
    tags: string[] = [],
    criadoPor: string = 'system',
  ) {
    const results = await Promise.allSettled(
      files.map((file) => this.uploadSingle(file, pasta, tags, criadoPor)),
    );

    const data = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value.data;
      return {
        nome: files[i].originalname,
        erro: r.reason?.message || 'Erro desconhecido',
      };
    });

    return { success: true, data };
  }

  async uploadImageWithVariants(
    file: Express.Multer.File,
    pasta: string = '/',
    tags: string[] = [],
    criadoPor: string = 'system',
  ) {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('O arquivo enviado não é uma imagem');
    }

    const hash = this.computeHash(file.buffer);
    const extensao = path.extname(file.originalname).toLowerCase();
    const nome = `${crypto.createHash('md5').update(file.originalname + Date.now()).digest('hex')}${extensao}`;
    const mimeType = file.mimetype;

    const sizes = {
      thumbnail: { width: 150, height: 150, fit: 'cover' as const },
      medium: { width: 400, height: 400, fit: 'inside' as const },
      large: { width: 1200, height: 1200, fit: 'inside' as const },
    };

    const variants: { nome: string; key: string; buffer: Buffer; dimensoes: any }[] = [];

    for (const [sizeName, sizeConfig] of Object.entries(sizes)) {
      const variantBuffer = await sharp(file.buffer)
        .resize(sizeConfig.width, sizeConfig.height, { fit: sizeConfig.fit })
        .toBuffer();

      const variantKey = this.generateKey(`${sizeName}_${nome}`, pasta, extensao);
      const metadata = await sharp(variantBuffer).metadata();

      variants.push({
        nome: `${sizeName}_${nome}`,
        key: variantKey,
        buffer: variantBuffer,
        dimensoes: { width: metadata.width, height: metadata.height },
      });
    }

    const uploadResults = await Promise.all(
      variants.map((v) => this.storageProvider.upload(v.buffer, v.key, mimeType)),
    );

    const arquivos = await Promise.all(
      variants.map((v, i) =>
        this.prisma.arquivo.create({
          data: {
            nome: v.nome,
            nomeOriginal: `${sizes[Object.keys(sizes)[i] as keyof typeof sizes].width}x${sizes[Object.keys(sizes)[i] as keyof typeof sizes].height}_${file.originalname}`,
            extensao,
            mimeType,
            tamanhoBytes: v.buffer.length,
            hash: this.computeHash(v.buffer),
            key: uploadResults[i].key,
            url: uploadResults[i].url,
            provedor: uploadResults[i].provedor,
            pasta,
            tags: [...tags, `variante:${Object.keys(sizes)[i]}`],
            dimensoes: v.dimensoes,
            status: 'ARMAZENADO',
            criadoPor,
          },
        }),
      ),
    );

    this.logger.log(`Image uploaded with variants: ${file.originalname}`);

    return { success: true, data: arquivos };
  }
}
