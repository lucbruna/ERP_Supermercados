import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VendasService } from './vendas.service';
import { CreateVendaConvenioDto, VendaConvenioQueryDto } from './dto/vendas.dto';

@ApiTags('Vendas (Convênio)')
@ApiBearerAuth()
@Controller()
export class VendasController {
  constructor(private readonly service: VendasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar venda via convênio (valida limite)' })
  async create(@Body() dto: CreateVendaConvenioDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vendas de convênio' })
  async findAll(@Query() query: VendaConvenioQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter venda por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar venda (estorna saldo do convênio)' })
  async cancelar(@Param('id') id: string) {
    return this.service.cancelar(id);
  }
}
