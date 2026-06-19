import { Module } from '@nestjs/common';
import { SugestaoCompraController } from './sugestao-compra.controller';
import { SugestaoCompraService } from './sugestao-compra.service';
import { StockValidatorService } from '../services/stock-validator.service';

@Module({
  controllers: [SugestaoCompraController],
  providers: [SugestaoCompraService, StockValidatorService],
  exports: [SugestaoCompraService],
})
export class SugestaoCompraModule {}
