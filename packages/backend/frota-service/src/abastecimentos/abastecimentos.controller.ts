import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AbastecimentosService } from './abastecimentos.service';
import { CreateAbastecimentoDto, UpdateAbastecimentoDto, AbastecimentoQueryDto, RelatorioConsumoQueryDto } from './dto/abastecimentos.dto';

@ApiTags('Abastecimentos')
@ApiBearerAuth()
@Controller('abastecimentos')
export class AbastecimentosController {
  constructor(private readonly service: AbastecimentosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar abastecimento' })
  async create(@Body() dto: CreateAbastecimentoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar abastecimentos' })
  @ApiQuery({ name: 'veiculoId', required: false })
  @ApiQuery({ name: 'periodo', required: false })
  async findAll(@Query() query: AbastecimentoQueryDto) {
    return this.service.findAll(query);
  }

  @Get('relatorio/consumo')
  @ApiOperation({ summary: 'Relatório de consumo médio por veículo/período' })
  async relatorioConsumo(@Query() query: RelatorioConsumoQueryDto) {
    return this.service.relatorioConsumo(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter abastecimento por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar abastecimento' })
  async update(@Param('id') id: string, @Body() dto: UpdateAbastecimentoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover abastecimento' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
