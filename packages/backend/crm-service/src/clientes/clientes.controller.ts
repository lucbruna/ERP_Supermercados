import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { SearchClienteDto } from './dto/search-cliente.dto';
import { CreateEnderecoDto, UpdateEnderecoDto } from './dto/endereco.dto';
import { CreditoService } from '../credito/credito.service';
import { CobrancaService } from '../cobranca/cobranca.service';
import { ComprasService } from '../compras/compras.service';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly creditoService: CreditoService,
    private readonly cobrancaService: CobrancaService,
    private readonly comprasService: ComprasService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes com busca e paginação' })
  findAll(@Query() query: SearchClienteDto) {
    return this.clientesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  findById(@Param('id') id: string) {
    return this.clientesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  update(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar cliente (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  async remove(@Param('id') id: string) {
    await this.clientesService.remove(id);
  }

  @Get(':id/historico')
  @ApiOperation({ summary: 'Obter histórico completo do cliente (cashback, pontos, cupons)' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  getHistorico(@Param('id') id: string) {
    return this.clientesService.getHistorico(id);
  }

  @Post(':clienteId/enderecos')
  @ApiOperation({ summary: 'Adicionar endereço ao cliente' })
  createEndereco(@Param('clienteId') clienteId: string, @Body() dto: CreateEnderecoDto) {
    return this.clientesService.createEndereco({ ...dto, clienteId });
  }

  @Put('enderecos/:id')
  @ApiOperation({ summary: 'Atualizar endereço do cliente' })
  updateEndereco(@Param('id') id: string, @Body() dto: UpdateEnderecoDto) {
    return this.clientesService.updateEndereco(id, dto);
  }

  @Delete('enderecos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover endereço do cliente' })
  async removeEndereco(@Param('id') id: string) {
    await this.clientesService.removeEndereco(id);
  }

  @Get(':id/credito')
  @ApiOperation({ summary: 'Obter dados de crédito do cliente' })
  getCredito(@Param('id') id: string) {
    return this.creditoService.obterCredito(id);
  }

  @Get(':id/cobrancas')
  @ApiOperation({ summary: 'Listar cobranças do cliente' })
  getCobrancas(@Param('id') id: string) {
    return this.cobrancaService.listar(id);
  }

  @Get(':id/compras')
  @ApiOperation({ summary: 'Listar compras do cliente' })
  getCompras(@Param('id') id: string, @Query('pagina') pagina?: number, @Query('limite') limite?: number) {
    return this.comprasService.listar(id, pagina || 1, limite || 10);
  }

  @Get(':id/compras/ultimas')
  @ApiOperation({ summary: 'Últimas compras do cliente' })
  getUltimasCompras(@Param('id') id: string, @Query('n') n?: number) {
    return this.comprasService.ultimas(id, n || 5);
  }

  @Get(':id/compras/resumo')
  @ApiOperation({ summary: 'Resumo estatístico de compras' })
  getResumoCompras(@Param('id') id: string) {
    return this.comprasService.resumo(id);
  }
}
