import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Stream, Readable } from 'stream';
import { StorageProvider, UploadResult } from './storage-provider.interface';

@Injectable()
export class LocalProvider implements StorageProvider {
  private readonly logger = new Logger(LocalProvider.name);
  private readonly storageDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.storageDir = this.configService.get('STORAGE_DIR', './storage');
    this.baseUrl = this.configService.get('STORAGE_BASE_URL', '/api/v1/storage/download');
    this.ensureStorageDir();
  }

  private ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
      this.logger.log(`Storage directory created at ${this.storageDir}`);
    }
  }

  private getFilePath(key: string): string {
    const filePath = path.join(this.storageDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return filePath;
  }

  async upload(fileBuffer: Buffer, key: string, _mimeType: string): Promise<UploadResult> {
    const filePath = this.getFilePath(key);
    await fs.promises.writeFile(filePath, fileBuffer);
    this.logger.log(`File uploaded locally: ${key}`);
    return {
      key,
      url: `${this.baseUrl}/local/${key}`,
      provedor: 'LOCAL',
    };
  }

  async download(key: string): Promise<Stream> {
    const filePath = path.join(this.storageDir, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${key}`);
    }
    return fs.createReadStream(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.storageDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      this.logger.log(`File deleted locally: ${key}`);
    }
  }

  async getUrl(key: string): Promise<string> {
    return `${this.baseUrl}/local/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.storageDir, key);
    return fs.existsSync(filePath);
  }
}
