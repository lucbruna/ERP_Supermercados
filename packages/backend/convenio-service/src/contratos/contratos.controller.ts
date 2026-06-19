import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContratosService } from './contratos.service';
import { CreateContratoDto, UpdateContratoDto, ContratoQueryDto } from './dto/contratos.dto';

@ApiTags('Contratos')
@ApiBearerAuth()
@Controller()
export class ContratosController {
  constructor(private readonly service: ContratosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar contrato' })
  async create(@Body() dto: CreateContratoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contratos' })
  async findAll(@Query() query: ContratoQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter contrato por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contrato' })
  async update(@Param('id') id: string, @Body() dto: UpdateContratoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar contrato' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/gerar-fatura')
  @ApiOperation({ summary: 'Gerar fatura a partir das vendas do contrato' })
  async gerarFatura(@Param('id') id: string) {
    return this.service.gerarFatura(id);
  }
}
