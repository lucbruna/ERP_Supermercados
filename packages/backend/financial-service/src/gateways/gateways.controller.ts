import {
  Controller, Get, Post, Body, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GatewaysService } from './gateways.service';
import { ProcessarPagamentoDto } from './dto/gateway.dto';

@ApiTags('Gateways de Pagamento')
@ApiBearerAuth()
@Controller('gateways')
export class GatewaysController {
  constructor(private readonly service: GatewaysService) {}

  @Post(':tipo/processar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Processar pagamento em gateway específico' })
  @ApiResponse({ status: 200, description: 'Pagamento processado' })
  @ApiResponse({ status: 400, description: 'Erro no processamento' })
  async processar(@Param('tipo') tipo: string, @Body() dto: ProcessarPagamentoDto) {
    return this.service.processar(tipo, dto);
  }

  @Post(':tipo/cancelar/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar/estornar transação em gateway' })
  @ApiResponse({ status: 200, description: 'Transação cancelada' })
  async cancelar(@Param('tipo') tipo: string, @Param('transactionId') transactionId: string) {
    return this.service.cancelar(tipo, transactionId);
  }

  @Get(':tipo/consultar/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consultar status de transação em gateway' })
  @ApiResponse({ status: 200, description: 'Status da transação' })
  async consultar(@Param('tipo') tipo: string, @Param('transactionId') transactionId: string) {
    return this.service.consultar(tipo, transactionId);
  }

  @Get('disponiveis')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar gateways disponíveis e seu status de configuração' })
  @ApiResponse({ status: 200, description: 'Lista de gateways' })
  async disponiveis() {
    return this.service.disponiveis();
  }
}
