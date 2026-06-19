import { Module } from '@nestjs/common';
import { CurvaAbcController } from './curva-abc.controller';
import { CurvaAbcService } from './curva-abc.service';
import { AbcCalculatorService } from '../services/abc-calculator.service';

@Module({
  controllers: [CurvaAbcController],
  providers: [CurvaAbcService, AbcCalculatorService],
  exports: [CurvaAbcService],
})
export class CurvaAbcModule {}
