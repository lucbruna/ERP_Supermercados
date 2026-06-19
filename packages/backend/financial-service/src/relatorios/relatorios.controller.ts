import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';
import { RelatorioFluxoCaixaDto, RelatorioAgingDto, RelatorioDreDto } from './dto/relatorio.dto';

@ApiTags('Relatórios Financeiros')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Post('fluxo-caixa')
  @ApiOperation({ summary: 'Relatório de fluxo de caixa por período' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso' })
  async relatorioFluxoCaixa(@Body() dto: RelatorioFluxoCaixaDto) {
    return this.service.relatorioFluxoCaixa(dto);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Relatório de aging (vencimentos) de contas a pagar/receber' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso' })
  async relatorioAging(@Query() dto: RelatorioAgingDto) {
    return this.service.relatorioAging(dto);
  }

  @Post('dre')
  @ApiOperation({ summary: 'Relatório DRE (Demonstração de Resultado do Exercício)' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso' })
  async relatorioDre(@Body() dto: RelatorioDreDto) {
    return this.service.relatorioDre(dto);
  }
}
