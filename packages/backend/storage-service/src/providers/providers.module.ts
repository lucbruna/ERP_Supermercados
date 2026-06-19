import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalProvider } from './local.provider';
import { S3Provider } from './s3.provider';
import { STORAGE_PROVIDER_TOKEN } from './storage-provider.interface';

const storageProviderFactory = {
  provide: STORAGE_PROVIDER_TOKEN,
  inject: [ConfigService, LocalProvider, S3Provider],
  useFactory: (configService: ConfigService, local: LocalProvider, s3: S3Provider) => {
    const provider = configService.get('STORAGE_PROVIDER', 'local');
    if (provider === 's3') {
      return s3;
    }
    return local;
  },
};

@Global()
@Module({
  providers: [LocalProvider, S3Provider, storageProviderFactory],
  exports: [STORAGE_PROVIDER_TOKEN, LocalProvider, S3Provider],
})
export class ProvidersModule {}
