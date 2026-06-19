import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CashbackService } from './cashback.service';
import { CreditarCashbackDto } from './dto/creditar-cashback.dto';
import { DebitarCashbackDto } from './dto/debitar-cashback.dto';

@ApiTags('Cashback')
@Controller('cashback')
export class CashbackController {
  constructor(private readonly cashbackService: CashbackService) {}

  @Post('creditar')
  @ApiOperation({ summary: 'Creditar cashback para cliente' })
  @ApiResponse({ status: 201, description: 'Cashback creditado com sucesso' })
  creditar(@Body() dto: CreditarCashbackDto) {
    return this.cashbackService.creditar(dto);
  }

  @Post('debitar')
  @ApiOperation({ summary: 'Debitar cashback do cliente (resgate)' })
  debitar(@Body() dto: DebitarCashbackDto) {
    return this.cashbackService.debitar(dto);
  }

  @Get('extrato/:clienteId')
  @ApiOperation({ summary: 'Obter extrato de cashback do cliente' })
  @ApiParam({ name: 'clienteId', description: 'ID do cliente' })
  extrato(
    @Param('clienteId') clienteId: string,
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
  ) {
    return this.cashbackService.extrato(clienteId, pagina, limite);
  }
}
