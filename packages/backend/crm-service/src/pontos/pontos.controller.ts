import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PontosService } from './pontos.service';
import { CreditarPontosDto } from './dto/creditar-pontos.dto';
import { DebitarPontosDto } from './dto/debitar-pontos.dto';

@ApiTags('Pontos')
@Controller('pontos')
export class PontosController {
  constructor(private readonly pontosService: PontosService) {}

  @Post('creditar')
  @ApiOperation({ summary: 'Creditar pontos para cliente' })
  @ApiResponse({ status: 201, description: 'Pontos creditados com sucesso' })
  creditar(@Body() dto: CreditarPontosDto) {
    return this.pontosService.creditar(dto);
  }

  @Post('debitar')
  @ApiOperation({ summary: 'Debitar pontos do cliente (resgate)' })
  debitar(@Body() dto: DebitarPontosDto) {
    return this.pontosService.debitar(dto);
  }

  @Get('extrato/:clienteId')
  @ApiOperation({ summary: 'Obter extrato de pontos do cliente' })
  @ApiParam({ name: 'clienteId', description: 'ID do cliente' })
  extrato(
    @Param('clienteId') clienteId: string,
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
  ) {
    return this.pontosService.extrato(clienteId, pagina, limite);
  }
}
