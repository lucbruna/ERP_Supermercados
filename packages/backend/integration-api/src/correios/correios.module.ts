import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CorreiosController } from './correios.controller';
import { CorreiosService } from './correios.service';
import { RatesCache } from './rates-cache';

@Module({
  imports: [HttpModule],
  controllers: [CorreiosController],
  providers: [CorreiosService, RatesCache],
  exports: [CorreiosService, RatesCache],
})
export class CorreiosModule {}
