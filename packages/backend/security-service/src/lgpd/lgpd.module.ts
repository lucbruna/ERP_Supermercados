import { Module } from '@nestjs/common';
import { LgpdController } from './lgpd.controller';
import { LgpdService } from './lgpd.service';
import { AnonymizationModule } from '../anonymization/anonymization.module';

@Module({
  imports: [AnonymizationModule],
  controllers: [LgpdController],
  providers: [LgpdService],
  exports: [LgpdService],
})
export class LgpdModule {}
