import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TabelasPrecoService } from './tabelas-preco.service';
import { CreateTabelaPrecoDto, UpdateTabelaPrecoDto, TabelaPrecoQueryDto, CalcularPrecoDto, AdicionarItemPrecoDto } from './dto/create-tabela-preco.dto';

@ApiTags('Tabelas de Preço')
@ApiBearerAuth()
@Controller('tabelas-preco')
export class TabelasPrecoController {
  constructor(private readonly service: TabelasPrecoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar tabela de preço' })
  async create(@Body() dto: CreateTabelaPrecoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tabelas de preço' })
  async findAll(@Query() query: TabelaPrecoQueryDto) {
    const companyId = (query as any).companyId || process.env.DEFAULT_COMPANY_ID || '';
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter tabela de preço' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tabela de preço' })
  async update(@Param('id') id: string, @Body() dto: UpdateTabelaPrecoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tabela de preço' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/itens')
  @ApiOperation({ summary: 'Adicionar item na tabela' })
  async adicionarItem(@Param('id') id: string, @Body() dto: AdicionarItemPrecoDto) {
    return this.service.adicionarItem(id, dto);
  }

  @Delete('itens/:itemId')
  @ApiOperation({ summary: 'Remover item da tabela' })
  async removerItem(@Param('itemId') itemId: string) {
    return this.service.removerItem(itemId);
  }

  @Post('calcular')
  @ApiOperation({ summary: 'Calcular melhor preço para produto' })
  async calcularPreco(@Body() dto: CalcularPrecoDto) {
    return this.service.calcularPreco(dto);
  }

  @Post('calcular-batch')
  @ApiOperation({ summary: 'Calcular preços para múltiplos produtos' })
  async calcularPrecoBatch(@Body() body: { companyId: string; items: { produtoId: string; quantidade?: number; clienteId?: string }[] }) {
    const companyId = body.companyId || process.env.DEFAULT_COMPANY_ID || '';
    return this.service.calcularPrecoBatch(companyId, body.items);
  }
}
