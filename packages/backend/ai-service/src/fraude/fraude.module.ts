import { Module } from '@nestjs/common';
import { FraudeController } from './fraude.controller';
import { FraudeService } from './fraude.service';
import { DeteccaoFraudeService } from '../services/deteccao-fraude.service';

@Module({
  controllers: [FraudeController],
  providers: [FraudeService, DeteccaoFraudeService],
  exports: [FraudeService],
})
export class FraudeModule {}
