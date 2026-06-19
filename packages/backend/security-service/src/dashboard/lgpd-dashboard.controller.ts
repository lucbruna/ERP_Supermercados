import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LgpdDashboardService } from './lgpd-dashboard.service';

@ApiTags('LGPD Dashboard')
@ApiBearerAuth()
@Controller('dashboard/lgpd')
export class LgpdDashboardController {
  constructor(private readonly service: LgpdDashboardService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo LGPD - total consentimentos, pendências, titulares' })
  async resumo() {
    return this.service.getResumo();
  }

  @Get('solicitacoes-mes')
  @ApiOperation({ summary: 'Solicitações de titular por mês' })
  async solicitacoesMes() {
    return this.service.getSolicitacoesPorMes();
  }

  @Get('tipos-dados')
  @ApiOperation({ summary: 'Tipos de dados pessoais armazenados' })
  async tiposDados() {
    return this.service.getTiposDados();
  }
}
