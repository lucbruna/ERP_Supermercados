import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto, UpdateVeiculoDto, UpdateSituacaoDto, UpdateKmDto, VeiculoQueryDto } from './dto/veiculos.dto';

@ApiTags('Veículos')
@ApiBearerAuth()
@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly service: VeiculosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar veículo' })
  async create(@Body() dto: CreateVeiculoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar veículos' })
  async findAll(@Query() query: VeiculoQueryDto) {
    return this.service.findAll(query);
  }

  @Get('disponiveis')
  @ApiOperation({ summary: 'Veículos disponíveis (sem rota ativa)' })
  async findDisponiveis() {
    return this.service.findDisponiveis();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter veículo por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/custos')
  @ApiOperation({ summary: 'Custo total do veículo' })
  async findCustos(@Param('id') id: string) {
    return this.service.findCustos(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  async update(@Param('id') id: string, @Body() dto: UpdateVeiculoDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/situacao')
  @ApiOperation({ summary: 'Alterar situação do veículo' })
  async updateSituacao(@Param('id') id: string, @Body() dto: UpdateSituacaoDto) {
    return this.service.updateSituacao(id, dto);
  }

  @Patch(':id/km')
  @ApiOperation({ summary: 'Atualizar km atual do veículo' })
  async updateKm(@Param('id') id: string, @Body() dto: UpdateKmDto) {
    return this.service.updateKm(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover (baixar) veículo' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
