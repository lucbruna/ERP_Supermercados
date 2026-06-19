import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnaliseFinanceiraService } from './analise-financeira.service';
import { FluxoCaixaDto, LucratividadeDto, InadimplenciaDto, CustosDto, RecomendacaoEconomiaDto } from './analise-financeira.dto';

@ApiTags('analise-financeira')
@Controller('analise-financeira')
export class AnaliseFinanceiraController {
  constructor(private readonly service: AnaliseFinanceiraService) {}

  @Post('fluxo-caixa')
  @ApiOperation({ summary: 'Analisar fluxo de caixa com tendências e sazonalidade' })
  async analisarFluxoCaixa(@Body() dto: FluxoCaixaDto) {
    const data = await this.service.analisarFluxoCaixa(dto);
    return { success: true, data };
  }

  @Post('lucratividade')
  @ApiOperation({ summary: 'Analisar lucratividade por categoria, loja, pagamento e segmento' })
  async analisarLucratividade(@Body() dto: LucratividadeDto) {
    const data = await this.service.analisarLucratividade(dto);
    return { success: true, data };
  }

  @Post('inadimplencia')
  @ApiOperation({ summary: 'Analisar inadimplência com aging e previsões' })
  async analisarInadimplencia(@Body() dto: InadimplenciaDto) {
    const data = await this.service.analisarInadimplencia(dto);
    return { success: true, data };
  }

  @Post('custos')
  @ApiOperation({ summary: 'Analisar custos fixos, variáveis e detecção de anomalias' })
  async analisarCustos(@Body() dto: CustosDto) {
    const data = await this.service.analisarCustos(dto);
    return { success: true, data };
  }

  @Get('recomendacoes')
  @ApiOperation({ summary: 'Obter recomendações de economia e corte de custos' })
  async recomendarEconomia() {
    const data = await this.service.recomendarEconomia();
    return { success: true, data };
  }
}
