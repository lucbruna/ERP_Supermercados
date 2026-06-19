import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TreinamentoService } from './treinamento.service';
import { CreateTreinamentoDto, UpdateTreinamentoDto, TreinamentoQueryDto, VincularFuncionarioDto, UpdateVinculoDto } from './dto/create-treinamento.dto';

@ApiTags('Treinamentos')
@ApiBearerAuth()
@Controller()
export class TreinamentoController {
  constructor(private readonly treinamentoService: TreinamentoService) {}

  @Post('treinamentos')
  @ApiOperation({ summary: 'Criar treinamento' })
  async create(@Body() dto: CreateTreinamentoDto) {
    return this.treinamentoService.create(dto);
  }

  @Get('treinamentos')
  @ApiOperation({ summary: 'Listar treinamentos' })
  async findAll(@Query() query: TreinamentoQueryDto) {
    return this.treinamentoService.findAll(query);
  }

  @Get('treinamentos/:id')
  @ApiOperation({ summary: 'Obter treinamento por ID' })
  async findOne(@Param('id') id: string) {
    return this.treinamentoService.findOne(id);
  }

  @Patch('treinamentos/:id')
  @ApiOperation({ summary: 'Atualizar treinamento' })
  async update(@Param('id') id: string, @Body() dto: UpdateTreinamentoDto) {
    return this.treinamentoService.update(id, dto);
  }

  @Delete('treinamentos/:id')
  @ApiOperation({ summary: 'Remover treinamento' })
  async remove(@Param('id') id: string) {
    return this.treinamentoService.remove(id);
  }

  @Post('treinamentos/vincular')
  @ApiOperation({ summary: 'Vincular funcionário a treinamento' })
  async vincularFuncionario(@Body() dto: VincularFuncionarioDto) {
    return this.treinamentoService.vincularFuncionario(dto);
  }

  @Patch('treinamentos/vinculos/:id')
  @ApiOperation({ summary: 'Atualizar vínculo de treinamento' })
  async updateVinculo(@Param('id') id: string, @Body() dto: UpdateVinculoDto) {
    return this.treinamentoService.updateVinculo(id, dto);
  }

  @Delete('treinamentos/vinculos/:id')
  @ApiOperation({ summary: 'Desvincular funcionário de treinamento' })
  async desvincularFuncionario(@Param('id') id: string) {
    return this.treinamentoService.desvincularFuncionario(id);
  }

  @Get('funcionarios/:funcionarioId/treinamentos')
  @ApiOperation({ summary: 'Listar treinamentos de um funcionário' })
  async listarPorFuncionario(@Param('funcionarioId') funcionarioId: string) {
    return this.treinamentoService.listarPorFuncionario(funcionarioId);
  }
}
