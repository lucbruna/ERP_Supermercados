import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo da frota' })
  async resumo() {
    return this.service.resumo();
  }

  @Get('custos')
  @ApiOperation({ summary: 'Custos por mês (combustível + manutenção)' })
  async custos() {
    return this.service.custos();
  }

  @Get('consumo')
  @ApiOperation({ summary: 'Consumo médio da frota' })
  async consumoMedio() {
    return this.service.consumoMedio();
  }
}
