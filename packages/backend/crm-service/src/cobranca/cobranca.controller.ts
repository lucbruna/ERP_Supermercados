import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CobrancaService } from './cobranca.service';
import { GerarCobrancaDto, RegistrarAcaoCobrancaDto, NegociarCobrancaDto, BaixarCobrancaDto } from './dto/gerar-cobranca.dto';

@ApiTags('Cobrança')
@Controller('cobrancas')
export class CobrancaController {
  constructor(private readonly cobrancaService: CobrancaService) {}

  @Post()
  @ApiOperation({ summary: 'Gerar nova cobrança' })
  gerar(@Body() dto: GerarCobrancaDto) {
    return this.cobrancaService.gerar(dto);
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: 'Listar cobranças do cliente' })
  listarPorCliente(@Param('clienteId') clienteId: string) {
    return this.cobrancaService.listar(clienteId);
  }

  @Get(':id/historico')
  @ApiOperation({ summary: 'Histórico de ações de cobrança' })
  historico(@Param('id') id: string) {
    return this.cobrancaService.historico(id);
  }

  @Post('acao')
  @ApiOperation({ summary: 'Registrar ação de cobrança' })
  registrarAcao(@Body() dto: RegistrarAcaoCobrancaDto) {
    return this.cobrancaService.registrarAcao(dto);
  }

  @Post(':id/negociar')
  @ApiOperation({ summary: 'Renegociar cobrança' })
  negociar(@Param('id') id: string, @Body() dto: NegociarCobrancaDto) {
    return this.cobrancaService.negociar(id, dto);
  }

  @Put(':id/baixar')
  @ApiOperation({ summary: 'Baixar cobrança como paga' })
  baixar(@Param('id') id: string, @Body() dto: BaixarCobrancaDto) {
    return this.cobrancaService.baixar(id, dto);
  }

  @Get('relatorio/inadimplencia')
  @ApiOperation({ summary: 'Relatório de inadimplência' })
  relatorioInadimplencia(@Query('companyId') companyId: string) {
    return this.cobrancaService.relatorioInadimplencia(companyId);
  }

  @Get('relatorio/aging')
  @ApiOperation({ summary: 'Relatório de aging (faixas de atraso)' })
  relatorioAging(@Query('companyId') companyId: string) {
    return this.cobrancaService.relatorioAging(companyId);
  }

  @Post(':id/negativar')
  @ApiOperation({ summary: 'Negativar cliente' })
  negativar(@Param('id') id: string) {
    return this.cobrancaService.negativar(id);
  }
}
