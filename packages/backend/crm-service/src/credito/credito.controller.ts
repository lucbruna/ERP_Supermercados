import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreditoService } from './credito.service';
import { DefinirLimiteDto, PagarCreditoDto } from './dto/definir-limite.dto';

@ApiTags('Crédito')
@Controller('credito')
export class CreditoController {
  constructor(private readonly creditoService: CreditoService) {}

  @Post('definir-limite')
  @ApiOperation({ summary: 'Definir/ajustar limite de crédito do cliente' })
  definirLimite(@Body() dto: DefinirLimiteDto) {
    return this.creditoService.definirLimite(dto);
  }

  @Get('extrato/:clienteId')
  @ApiOperation({ summary: 'Extrato de transações de crédito' })
  extrato(
    @Param('clienteId') clienteId: string,
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
  ) {
    return this.creditoService.extrato(clienteId, pagina || 1, limite || 10);
  }

  @Post('pagar')
  @ApiOperation({ summary: 'Registrar pagamento de crédito' })
  pagar(@Body() dto: PagarCreditoDto) {
    return this.creditoService.pagar(dto);
  }

  @Post('bloquear/:clienteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bloquear crédito do cliente' })
  bloquear(@Param('clienteId') clienteId: string) {
    return this.creditoService.bloquear(clienteId);
  }

  @Get('relatorio')
  @ApiOperation({ summary: 'Relatório geral de crédito' })
  relatorio(@Query('companyId') companyId: string) {
    return this.creditoService.relatorio(companyId);
  }

  @Get('analisar/:clienteId')
  @ApiOperation({ summary: 'Análise de crédito do cliente' })
  analisar(@Param('clienteId') clienteId: string) {
    return this.creditoService.analisar(clienteId);
  }
}
