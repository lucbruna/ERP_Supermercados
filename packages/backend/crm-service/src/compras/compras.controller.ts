import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ComprasService } from './compras.service';
import { SyncCompraDto } from './dto/sync-compra.dto';

@ApiTags('Compras (Histórico)')
@Controller('clientes')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post(':clienteId/compras/sincronizar')
  @ApiOperation({ summary: 'Sincronizar compra do PDV para o CRM' })
  sincronizar(@Param('clienteId') clienteId: string, @Body() dto: SyncCompraDto) {
    return this.comprasService.sincronizar({ ...dto, clienteId });
  }

  @Get(':clienteId/compras')
  @ApiOperation({ summary: 'Listar histórico de compras do cliente' })
  listar(
    @Param('clienteId') clienteId: string,
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
  ) {
    return this.comprasService.listar(clienteId, pagina || 1, limite || 10);
  }

  @Get(':clienteId/compras/ultimas')
  @ApiOperation({ summary: 'Últimas N compras do cliente' })
  ultimas(
    @Param('clienteId') clienteId: string,
    @Query('n') n?: number,
  ) {
    return this.comprasService.ultimas(clienteId, n || 5);
  }

  @Get(':clienteId/compras/:vendaId')
  @ApiOperation({ summary: 'Detalhes de uma compra específica' })
  detalhe(@Param('clienteId') clienteId: string, @Param('vendaId') vendaId: string) {
    return this.comprasService.detalhe(clienteId, vendaId);
  }

  @Get(':clienteId/compras/resumo')
  @ApiOperation({ summary: 'Resumo estatístico das compras do cliente' })
  resumo(@Param('clienteId') clienteId: string) {
    return this.comprasService.resumo(clienteId);
  }
}
