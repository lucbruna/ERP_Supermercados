import {
  Controller, Get, Post, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FluxoCaixaService } from './fluxo-caixa.service';
import { GerarProjecaoDto, QueryFluxoCaixaDto } from './dto/fluxo-caixa.dto';

@ApiTags('Fluxo de Caixa')
@ApiBearerAuth()
@Controller('fluxo-caixa')
export class FluxoCaixaController {
  constructor(private readonly service: FluxoCaixaService) {}

  @Get('saldo')
  @ApiOperation({ summary: 'Consultar saldo e projeções de fluxo de caixa' })
  @ApiResponse({ status: 200, description: 'Dados de fluxo de caixa' })
  async consultarSaldo(@Query() query: QueryFluxoCaixaDto) {
    return this.service.consultarSaldo(query);
  }

  @Post('projetar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar projeção de fluxo de caixa' })
  @ApiResponse({ status: 200, description: 'Projeção gerada com sucesso' })
  async gerarProjecao(@Body() dto: GerarProjecaoDto) {
    return this.service.gerarProjecao(dto);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Obter resumo financeiro' })
  async getResumo(
    @Query('companyId') companyId: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.service.getResumo(companyId, dataInicio, dataFim);
  }
}
