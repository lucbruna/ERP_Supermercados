import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Stream } from 'stream';
import { StorageProvider, UploadResult } from './storage-provider.interface';

@Injectable()
export class S3Provider implements StorageProvider {
  private readonly logger = new Logger(S3Provider.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get('S3_BUCKET', 'crm-storage');
    this.region = this.configService.get('MINIO_REGION', this.configService.get('S3_REGION', 'us-east-1'));

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('MINIO_ACCESS_KEY', this.configService.get('S3_ACCESS_KEY_ID', '')),
        secretAccessKey: this.configService.get('MINIO_SECRET_KEY', this.configService.get('S3_SECRET_ACCESS_KEY', '')),
      },
      endpoint: this.configService.get('MINIO_ENDPOINT', this.configService.get('S3_ENDPOINT', 'http://minio:9000')),
      forcePathStyle: true,
    });
  }

  async upload(fileBuffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await this.client.send(command);
    this.logger.log(`File uploaded to S3: ${key}`);

    return {
      key,
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      bucket: this.bucket,
      provedor: 'S3',
    };
  }

  async download(key: string): Promise<Stream> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    return response.Body as Stream;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    this.logger.log(`File deleted from S3: ${key}`);
  }

  async getUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
    return url;
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
