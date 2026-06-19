import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';

@ApiTags('Relatórios')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo de produtos com/sem código de barras' })
  async resumo() {
    return this.relatoriosService.resumo();
  }

  @Get('etiquetas')
  @ApiOperation({ summary: 'Estatísticas de uso de etiquetas' })
  async etiquetas() {
    return this.relatoriosService.etiquetas();
  }
}
