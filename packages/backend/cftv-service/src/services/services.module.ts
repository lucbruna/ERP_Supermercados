import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiDetectionService } from './ai-detection.service';
import { AlertService } from './alert.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [AiDetectionService, AlertService],
  exports: [AiDetectionService, AlertService],
})
export class ServicesModule {}
