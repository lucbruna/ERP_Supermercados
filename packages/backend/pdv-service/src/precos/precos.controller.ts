import { Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrecosService } from './precos.service';

@ApiTags('Preços')
@ApiBearerAuth()
@Controller('precos')
export class PrecosController {
  constructor(private readonly precosService: PrecosService) {}

  @Get('consulta/:produtoId')
  @ApiOperation({ summary: 'Consultar preço atual de um produto' })
  async consultarPreco(
    @Param('produtoId') produtoId: string,
    @Query('clienteId') clienteId?: string,
    @Query('tabelaId') tabelaId?: string,
  ) {
    return this.precosService.consultarPreco(produtoId, clienteId, tabelaId);
  }

  @Get('historico/:produtoId')
  @ApiOperation({ summary: 'Obter histórico de preços de um produto' })
  async getPrecoHistory(@Param('produtoId') produtoId: string) {
    return this.precosService.getPrecoHistory(produtoId);
  }
}
