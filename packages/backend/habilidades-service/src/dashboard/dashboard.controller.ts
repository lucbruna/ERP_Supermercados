import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo geral do sistema' })
  async resumo() {
    return this.dashboardService.resumo();
  }

  @Get('competencias')
  @ApiOperation({ summary: 'Competências mais e menos comuns na organização' })
  async competencias() {
    return this.dashboardService.competencias();
  }

  @Get('funcionario/:id')
  @ApiOperation({ summary: 'Perfil completo de competências do funcionário' })
  async perfilFuncionario(@Param('id') id: string) {
    return this.dashboardService.perfilFuncionario(id);
  }
}
