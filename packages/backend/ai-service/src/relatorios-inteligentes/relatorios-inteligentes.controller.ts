import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RelatoriosInteligentesService } from './relatorios-inteligentes.service';
import { RelatorioVendasDto, RelatorioEstoqueDto, RelatorioRHDto, RelatorioResumoExecutivoDto, GrupoRelatorio } from './relatorios-inteligentes.dto';

@ApiTags('relatorios-inteligentes')
@Controller('relatorios-inteligentes')
export class RelatoriosInteligentesController {
  constructor(private readonly service: RelatoriosInteligentesService) {}

  @Post('vendas')
  @ApiOperation({ summary: 'Gerar relatório inteligente de vendas com análise textual' })
  async gerarRelatorioVendas(@Body() dto: RelatorioVendasDto) {
    const data = await this.service.gerarRelatorioVendas(dto, dto.grupo);
    return { success: true, data };
  }

  @Post('estoque')
  @ApiOperation({ summary: 'Gerar relatório inteligente de estoque com alertas' })
  async gerarRelatorioEstoque(@Body() dto: RelatorioEstoqueDto) {
    const data = await this.service.gerarRelatorioEstoque(dto);
    return { success: true, data };
  }

  @Post('rh')
  @ApiOperation({ summary: 'Gerar relatório inteligente de RH' })
  async gerarRelatorioRH(@Body() dto: RelatorioRHDto) {
    const data = await this.service.gerarRelatorioRH(dto);
    return { success: true, data };
  }

  @Post('resumo-executivo')
  @ApiOperation({ summary: 'Gerar resumo executivo com KPIs e ações prioritárias' })
  async gerarResumoExecutivo(@Body() dto: RelatorioResumoExecutivoDto) {
    const data = await this.service.gerarResumoExecutivo(dto);
    return { success: true, data };
  }
}
