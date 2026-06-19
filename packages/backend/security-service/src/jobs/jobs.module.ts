import { Module } from '@nestjs/common';
import { DataRetentionJob } from './data-retention.job';
import { AnonymizationModule } from '../anonymization/anonymization.module';

@Module({
  imports: [AnonymizationModule],
  providers: [DataRetentionJob],
})
export class JobsModule {}
