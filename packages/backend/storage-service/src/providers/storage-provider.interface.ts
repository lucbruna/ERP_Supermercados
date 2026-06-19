import { Stream } from 'stream';

export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER';

export interface UploadResult {
  key: string;
  url: string;
  bucket?: string;
  provedor: 'LOCAL' | 'S3' | 'AZURE' | 'GCS';
}

export interface StorageProvider {
  upload(
    fileBuffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<UploadResult>;

  download(key: string): Promise<Stream>;

  delete(key: string): Promise<void>;

  getUrl(key: string): Promise<string>;

  exists(key: string): Promise<boolean>;
}
